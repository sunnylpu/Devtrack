import { useQuery } from '@tanstack/react-query';
import { githubService } from '../services';
import { Github, ExternalLink, Star, GitCommit, Code2, Link } from 'lucide-react';
import { format } from 'date-fns';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#7c3aed', Python: '#16a34a',
  Java: '#b07219', Go: '#f59e0b', Rust: '#dea584', CSS: '#563d7c',
  HTML: '#e34c26', C: '#555555', 'C++': '#f34b7d', Ruby: '#701516',
};

function HeatmapGrid({ weeks }) {
  if (!weeks?.length) return <div className="text-sm" style={{ color: 'var(--subtle)' }}>No contribution data</div>;

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
                  background: day.contributionCount === 0
                    ? 'var(--surface-2)'
                    : day.contributionCount < 3
                    ? 'var(--accent-panel)'
                    : day.contributionCount < 6
                    ? 'var(--accent-strong)'
                    : day.contributionCount < 10
                    ? 'var(--accent)'
                    : 'var(--accent-strong)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GitHubPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['github', 'activity'],
    queryFn: () => githubService.getActivity().then(r => r.data.data),
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['github', 'heatmap'],
    queryFn: () => githubService.getHeatmap().then(r => r.data.data),
    enabled: data?.connected,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-panel)' }}
          >
            <Github size={40} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Connect GitHub</h2>
          <p className="mb-6 text-sm max-w-md" style={{ color: 'var(--subtle)' }}>
            Connect your GitHub account to track commits, repos, contribution heatmap, and language stats.
          </p>
          <button
            onClick={githubService.connect}
            className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
          >
            <Github size={18} /> Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {data.avatarUrl && (
          <img src={data.avatarUrl} alt={data.username} className="w-12 h-12 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {data.username} <span className="gradient-text">on GitHub</span>
          </h1>
          <a href={data.profileUrl} target="_blank" rel="noreferrer"
            className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View Profile <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--muted)' }}>CONTRIBUTION HEATMAP</h3>
          {heatmapData?.totalContributions && (
            <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
              {heatmapData.totalContributions} contributions this year
            </span>
          )}
        </div>
        <HeatmapGrid weeks={heatmapData?.weeks || []} />
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--subtle)' }}>
          <span>Less</span>
          {['var(--surface-2)', 'var(--accent-panel)', 'var(--accent-strong)', 'var(--accent)', 'var(--accent-strong)'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Commits */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--muted)' }}>RECENT COMMITS</h3>
          <div className="space-y-3">
            {(data.recentCommits || []).slice(0, 8).map((commit, i) => (
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
            {(!data.recentCommits || data.recentCommits.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>No recent commits</p>
            )}
          </div>
        </div>

        {/* Repos & Languages */}
        <div className="space-y-4">
          {/* Languages */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--muted)' }}>LANGUAGES</h3>
            <div className="flex flex-wrap gap-2">
              {(data.languages || []).map(({ lang, count }) => (
                <div
                  key={lang}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: LANG_COLORS[lang] || 'var(--accent)' }}
                  />
                  <span style={{ color: 'var(--text)' }}>{lang}</span>
                  <span style={{ color: 'var(--subtle)' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Repos */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--muted)' }}>RECENT REPOS</h3>
            <div className="space-y-2">
              {(data.repos || []).slice(0, 5).map(repo => (
                <div key={repo.name} className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Code2 size={13} />
                    {repo.name}
                  </a>
                  <div className="flex items-center gap-2">
                    {repo.language && (
                      <span className="text-xs" style={{ color: 'var(--subtle)' }}>{repo.language}</span>
                    )}
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--warning)' }}>
                      <Star size={11} />
                      {repo.stars}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
