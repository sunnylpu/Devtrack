import { GitCommit, ExternalLink, Star, Code2 } from 'lucide-react';
import { format } from 'date-fns';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#7c3aed', Python: '#16a34a',
  Java: '#b07219', Go: '#f59e0b', Rust: '#dea584', CSS: '#563d7c',
  HTML: '#e34c26', 'C++': '#f34b7d', Ruby: '#701516',
};

export function CommitList({ commits = [] }) {
  if (!commits.length) {
    return <p className="text-sm" style={{ color: 'var(--subtle)' }}>No recent commits</p>;
  }
  return (
    <div className="space-y-3">
      {commits.slice(0, 8).map((commit, i) => (
        <div key={i} className="flex gap-3">
          <GitCommit size={14} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{commit.message}</p>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>
              {commit.repo} · {format(new Date(commit.date), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LanguageBadges({ languages = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map(({ lang, count }) => (
        <div
          key={lang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[lang] || 'var(--accent)' }} />
          <span style={{ color: 'var(--text)' }}>{lang}</span>
          <span style={{ color: 'var(--subtle)' }}>({count})</span>
        </div>
      ))}
    </div>
  );
}

export function RepoList({ repos = [] }) {
  return (
    <div className="space-y-2">
      {repos.slice(0, 5).map(repo => (
        <div key={repo.name} className="flex items-center justify-between">
          <a
            href={repo.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            <Code2 size={13} />{repo.name}
          </a>
          <div className="flex items-center gap-2">
            {repo.language && <span className="text-xs" style={{ color: 'var(--subtle)' }}>{repo.language}</span>}
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--warning)' }}>
              <Star size={11} />{repo.stars}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeatmapGrid({ weeks = [] }) {
  if (!weeks.length) return <div className="text-sm" style={{ color: 'var(--subtle)' }}>No contribution data</div>;
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.contributionDays.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.contributionCount} contributions`}
                className="w-3 h-3 rounded-sm transition-all hover:scale-125"
                style={{
                  background: day.contributionCount === 0 ? 'var(--surface-2)'
                    : day.contributionCount < 3 ? 'var(--accent-panel)'
                    : day.contributionCount < 6 ? 'var(--accent-strong)'
                    : day.contributionCount < 10 ? 'var(--accent)' : 'var(--accent-strong)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
