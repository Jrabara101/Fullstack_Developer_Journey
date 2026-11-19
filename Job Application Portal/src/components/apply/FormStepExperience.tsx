import React, { useState } from 'react';
import { Briefcase, GraduationCap, Edit3, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkExperience, Education } from '../../types/index.ts';

interface FormStepExperienceProps {
  workHistory: WorkExperience[];
  education: Education[];
  skills: string[];
  onChangeWorkHistory: (work: WorkExperience[]) => void;
  onChangeEducation: (edu: Education[]) => void;
  onChangeSkills: (skills: string[]) => void;
  onFocusField: (fieldKey: string) => void;
  onBlurField: () => void;
}

export const FormStepExperience: React.FC<FormStepExperienceProps> = ({
  workHistory,
  education,
  skills,
  onChangeWorkHistory,
  onChangeEducation,
  onChangeSkills,
  onFocusField,
  onBlurField
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const toggleEdit = (id: string) => {
    setEditingId(prev => (prev === id ? null : id));
  };

  const handleUpdateWork = (index: number, updated: Partial<WorkExperience>) => {
    const list = [...workHistory];
    list[index] = { ...list[index], ...updated };
    onChangeWorkHistory(list);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      onChangeSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChangeSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-divider-light dark:border-divider-dark pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Work Experience & Education
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Parsed from your resume. Tweak titles, dates, or highlights if needed.
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          ✓ Zero-retyping active
        </span>
      </div>

      {/* Work History Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-brand-500" />
          <span>Work History ({workHistory.length})</span>
        </h4>

        {workHistory.map((work, idx) => {
          const isEditing = editingId === work.id;

          return (
            <div
              key={work.id || idx}
              onMouseEnter={() => onFocusField(`workHistory.${idx}`)}
              onMouseLeave={onBlurField}
              className={`rounded-xl border transition-all p-4 ${
                isEditing
                  ? 'border-brand-500/50 bg-surface-secondary-light/80 dark:bg-surface-secondary-dark/80 shadow-xs'
                  : 'border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {work.role} <span className="text-slate-400">at</span> {work.company}
                  </h5>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {work.startDate} – {work.endDate} {work.isCurrent && '• Current Role'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEdit(work.id)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-divider-light dark:border-divider-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3 h-3 text-slate-400" />
                  <span>{isEditing ? 'Done' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                <div className="mt-4 pt-3 border-t border-divider-light dark:border-divider-dark space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={work.role}
                        onChange={e => handleUpdateWork(idx, { role: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={e => handleUpdateWork(idx, { company: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Description & Achievements</label>
                    <textarea
                      rows={2}
                      value={work.description}
                      onChange={e => handleUpdateWork(idx, { description: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                work.description && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {work.description}
                  </p>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Education Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
          <span>Education</span>
        </h4>

        {education.map((edu, idx) => (
          <div
            key={idx}
            onMouseEnter={() => onFocusField('education.0')}
            onMouseLeave={onBlurField}
            className="p-3.5 rounded-xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark flex items-center justify-between"
          >
            <div>
              <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {edu.institution}
              </h5>
              <p className="text-[11px] text-slate-500">
                {edu.degree} in {edu.field}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{edu.graduationYear}</span>
          </div>
        ))}
      </div>

      {/* Skills Matrix Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Detected Skills Vector ({skills.length})
        </h4>

        <div className="flex flex-wrap gap-1.5">
          {skills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-red-500 transition-colors"
                title="Remove skill tag"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Add custom skill input */}
        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-xs mt-2">
          <input
            type="text"
            placeholder="Add another skill..."
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            className="flex-1 px-2.5 py-1 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};
