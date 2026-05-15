import { GitCommit, ExternalLink, Star, Code2 } from 'lucide-react';
import { format } from 'date-fns';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', Go: '#00add8', Rust: '#dea584', CSS: '#563d7c',
  HTML: '#e34c26', 'C++': '#f34b7d', Ruby: '#701516',
};

export function CommitList({ commits = [] }) {
  if (!commits.length) {
    return <p className="text-sm" style={{ color: '#566082' }}>No recent commits</p>;
  }
  return (
    <div className="space-y-3">
      {commits.slice(0, 8).map((commit, i) => (
        <div key={i} className="flex gap-3">
          <GitCommit size={14} style={{ color: '#3b6dfb', marginTop: 2, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: '#e2e8f0' }}>{commit.message}</p>
            <p className="text-xs" style={{ color: '#566082' }}>
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
          style={{ background: '#1c2236', border: '1px solid #2a3250' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[lang] || '#3b6dfb' }} />
          <span style={{ color: '#e2e8f0' }}>{lang}</span>
          <span style={{ color: '#566082' }}>({count})</span>
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
            style={{ color: '#3b6dfb' }}
          >
            <Code2 size={13} />{repo.name}
          </a>
          <div className="flex items-center gap-2">
            {repo.language && <span className="text-xs" style={{ color: '#566082' }}>{repo.language}</span>}
            <div className="flex items-center gap-1 text-xs" style={{ color: '#facc15' }}>
              <Star size={11} />{repo.stars}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeatmapGrid({ weeks = [] }) {
  if (!weeks.length) return <div className="text-sm" style={{ color: '#566082' }}>No contribution data</div>;
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
                  background: day.contributionCount === 0 ? '#1c2236'
                    : day.contributionCount < 3 ? 'rgba(59,109,251,0.3)'
                    : day.contributionCount < 6 ? 'rgba(59,109,251,0.6)'
                    : day.contributionCount < 10 ? '#3b6dfb' : '#7c3aed',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
