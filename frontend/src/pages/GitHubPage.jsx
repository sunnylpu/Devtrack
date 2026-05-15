import { useQuery } from '@tanstack/react-query';
import { githubService } from '../services';
import { Github, ExternalLink, Star, GitCommit, Code2, Link } from 'lucide-react';
import { format } from 'date-fns';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', Go: '#00add8', Rust: '#dea584', CSS: '#563d7c',
  HTML: '#e34c26', C: '#555555', 'C++': '#f34b7d', Ruby: '#701516',
};

function HeatmapGrid({ weeks }) {
  if (!weeks?.length) return <div className="text-sm" style={{ color: '#566082' }}>No contribution data</div>;

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
                    ? '#1c2236'
                    : day.contributionCount < 3
                    ? 'rgba(59,109,251,0.3)'
                    : day.contributionCount < 6
                    ? 'rgba(59,109,251,0.6)'
                    : day.contributionCount < 10
                    ? '#3b6dfb'
                    : '#7c3aed',
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
            style={{ background: 'rgba(59,109,251,0.1)', border: '1px solid rgba(59,109,251,0.2)' }}
          >
            <Github size={40} style={{ color: '#3b6dfb' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#e2e8f0' }}>Connect GitHub</h2>
          <p className="mb-6 text-sm max-w-md" style={{ color: '#566082' }}>
            Connect your GitHub account to track commits, repos, contribution heatmap, and language stats.
          </p>
          <button
            onClick={githubService.connect}
            className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
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
          <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
            {data.username} <span className="gradient-text">on GitHub</span>
          </h1>
          <a href={data.profileUrl} target="_blank" rel="noreferrer"
            className="text-sm flex items-center gap-1" style={{ color: '#3b6dfb' }}>
            View Profile <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: '#94a3b8' }}>CONTRIBUTION HEATMAP</h3>
          {heatmapData?.totalContributions && (
            <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>
              {heatmapData.totalContributions} contributions this year
            </span>
          )}
        </div>
        <HeatmapGrid weeks={heatmapData?.weeks || []} />
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#566082' }}>
          <span>Less</span>
          {['#1c2236', 'rgba(59,109,251,0.3)', 'rgba(59,109,251,0.6)', '#3b6dfb', '#7c3aed'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Commits */}
        <div className="rounded-2xl p-6" style={{ background: '#141827', border: '1px solid #2a3250' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#94a3b8' }}>RECENT COMMITS</h3>
          <div className="space-y-3">
            {(data.recentCommits || []).slice(0, 8).map((commit, i) => (
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
            {(!data.recentCommits || data.recentCommits.length === 0) && (
              <p className="text-sm" style={{ color: '#566082' }}>No recent commits</p>
            )}
          </div>
        </div>

        {/* Repos & Languages */}
        <div className="space-y-4">
          {/* Languages */}
          <div className="rounded-2xl p-5" style={{ background: '#141827', border: '1px solid #2a3250' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: '#94a3b8' }}>LANGUAGES</h3>
            <div className="flex flex-wrap gap-2">
              {(data.languages || []).map(({ lang, count }) => (
                <div
                  key={lang}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: '#1c2236', border: '1px solid #2a3250' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: LANG_COLORS[lang] || '#3b6dfb' }}
                  />
                  <span style={{ color: '#e2e8f0' }}>{lang}</span>
                  <span style={{ color: '#566082' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Repos */}
          <div className="rounded-2xl p-5" style={{ background: '#141827', border: '1px solid #2a3250' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: '#94a3b8' }}>RECENT REPOS</h3>
            <div className="space-y-2">
              {(data.repos || []).slice(0, 5).map(repo => (
                <div key={repo.name} className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: '#3b6dfb' }}
                  >
                    <Code2 size={13} />
                    {repo.name}
                  </a>
                  <div className="flex items-center gap-2">
                    {repo.language && (
                      <span className="text-xs" style={{ color: '#566082' }}>{repo.language}</span>
                    )}
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#facc15' }}>
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
