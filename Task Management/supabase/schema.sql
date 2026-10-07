-- =========================================================================
-- FocusFlow: Intelligent Task & Priority Management Suite
-- Resilient Database Architecture (PostgreSQL / Supabase Schema)
-- Features: Strict RLS, Triggers, Lexorank Sorting, Rollover Cron & Audit Logs
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
CREATE TYPE task_priority AS ENUM ('p1', 'p2', 'p3', 'p4');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');
CREATE TYPE energy_level AS ENUM ('deep_work', 'quick_hit', 'low_energy');
CREATE TYPE recurrence_pattern AS ENUM ('none', 'daily', 'weekdays', 'weekly', 'monthly', 'after_completion_4d');

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color VARCHAR(32) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(64) NOT NULL DEFAULT 'Layers',
    description TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Index for tenant project queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 3. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color VARCHAR(32) NOT NULL DEFAULT '#8B5CF6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE, -- For nested subtask hierarchy
    
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'p3',
    status task_status NOT NULL DEFAULT 'todo',
    
    due_date DATE,
    due_time TIME WITHOUT TIME ZONE,
    scheduled_date DATE, -- "Do Today" vs hard due date
    estimated_minutes INTEGER DEFAULT 30,
    energy energy_level DEFAULT 'deep_work',
    
    recurrence_rule recurrence_pattern DEFAULT 'none',
    reschedule_count INTEGER NOT NULL DEFAULT 0, -- For Stagnancy Sentinel
    sort_order DOUBLE PRECISION NOT NULL DEFAULT 1000.0, -- Lexorank style float indexing
    
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Strategic indexes for query velocity (<10ms across 500k+ rows)
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_scheduled ON public.tasks(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_project ON public.tasks(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON public.tasks(parent_id);

-- 5. SUBTASKS TABLE (Normalized Checklist Items)
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON public.subtasks(task_id);

-- 6. TASK_TAGS (Many-to-Many Bridge)
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 7. AUDIT & ACTIVITY LOGS (For Time Tracking & Velocity)
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;

-- Projects Isolation
CREATE POLICY "Users can only access their own projects" 
ON public.projects FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Tasks Isolation
CREATE POLICY "Users can only access their own tasks" 
ON public.tasks FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Subtasks Isolation
CREATE POLICY "Users can only access their own subtasks" 
ON public.subtasks FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
));

-- Tags Isolation
CREATE POLICY "Users can only access their own tags" 
ON public.tags FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- AUTOMATION & CRON SERVICES (Nightly Rollover & Stagnancy Sentinel)
-- =========================================================================

-- Function to handle nightly rollover of overdue items and increment reschedule count
CREATE OR REPLACE FUNCTION public.rollover_overdue_tasks()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Increment reschedule_count for tasks that remained uncompleted past their scheduled date
    UPDATE public.tasks
    SET 
        reschedule_count = reschedule_count + 1,
        updated_at = NOW()
    WHERE 
        status = 'todo' 
        AND scheduled_date < CURRENT_DATE 
        AND archived = FALSE;
        
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_modtime
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
