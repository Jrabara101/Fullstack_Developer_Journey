import React from 'react';
import { HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { JobPosting } from '../../types/index.ts';

interface FormStepQuestionsProps {
  questions: JobPosting['screeningQuestions'];
  answers: Record<string, string>;
  onChangeAnswer: (questionId: string, value: string) => void;
}

export const FormStepQuestions: React.FC<FormStepQuestionsProps> = ({
  questions,
  answers,
  onChangeAnswer
}) => {
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-divider-light dark:border-divider-dark pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Role-Specific Screening Questions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share how you approach real-world engineering and architecture challenges.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {questions.length} short question{questions.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const currentAnswer = answers[q.id] || '';
          const wordCount = countWords(currentAnswer);
          const target = q.recommendedWordCount || 150;
          const isTargetMet = wordCount >= Math.floor(target * 0.7);

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  <span className="text-brand-600 dark:text-brand-400 font-mono mr-1.5">{idx + 1}.</span>
                  {q.question}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={5}
                  value={currentAnswer}
                  onChange={e => onChangeAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder || 'Type your response here... Markdown formatting supported.'}
                  className="w-full p-3.5 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 leading-relaxed resize-y"
                />
              </div>

              {/* Word counter & Keystroke Autosave micro-indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Answer autosaved locally & to cloud</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`tabular-nums font-semibold ${
                      isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {wordCount} / {target} words
                  </span>
                  {isTargetMet && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Target met
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
