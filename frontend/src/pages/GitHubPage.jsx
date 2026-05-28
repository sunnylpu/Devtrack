import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { githubService } from '../services';
import {
  Github, ExternalLink, Star, GitCommit, Code2, Link2, Loader2,
  Unlink, Users, BookOpen, MapPin, Building2, Globe, GitFork,
  Eye, AlertCircle, GitBranch, X, Calendar, Hash, ChevronLeft,
  ChevronRight, Package, Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', CSS: '#563d7c',
  HTML: '#e34c26', 'C++': '#f34b7d', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#7F52FF', Dart: '#00B4AB', Shell: '#89e051',
  Vue: '#41b883', Svelte: '#ff3e00',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value?.toLocaleString?.() ?? value}</p>
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Language Bar ─────────────────────────────────────────────────────────────
function LanguageBar({ repos = [] }) {
  const langMap = {};
  repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
  const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = sorted.reduce((s, [, c]) => s + c, 0);

  if (!sorted.length) return null;
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {sorted.map(([lang, count]) => (
          <div
            key={lang}
            style={{ width: `${(count / total) * 100}%`, background: LANG_COLORS[lang] || 'var(--accent)' }}
            title={`${lang}: ${count} repos`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {sorted.map(([lang, count]) => (
          <div key={lang} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[lang] || 'var(--accent)' }} />
            <span>{lang}</span>
            <span style={{ color: 'var(--subtle)' }}>{Math.round((count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Repo Card ────────────────────────────────────────────────────────────────
function RepoCard({ repo, onClick }) {
  return (
    <div
      onClick={() => onClick(repo)}
      className="group rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>{repo.name}</span>
        </div>
        <ExternalLink size={12} style={{ color: 'var(--subtle)', flexShrink: 0, marginTop: 2 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {repo.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{repo.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--subtle)' }}>
        {repo.language && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[repo.language] || 'var(--accent)' }} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1"><Star size={11} style={{ color: 'var(--warning)' }} />{repo.stars}</span>
        <span className="flex items-center gap-1"><GitFork size={11} />{repo.forks}</span>
      </div>
    </div>
  );
}

// ─── Repo Modal ───────────────────────────────────────────────────────────────
function RepoModal({ repo, username, onClose }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['github', 'repo-commits', username, repo.name, page],
    queryFn: () => githubService.getRepoCommits(username, repo.name, page).then(r => r.data.data),
    keepPreviousData: true,
  });

  const repoInfo = data?.repoInfo || repo;
  const commits = data?.commits || [];

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          background: 'linear-gradient(145deg, var(--surface), var(--surface-2))',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text)' }}>
                {username}/<span style={{ color: 'var(--accent)' }}>{repo.name}</span>
              </h2>
            </div>
            {repoInfo.description && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{repoInfo.description}</p>
            )}
            {/* Topics */}
            {repoInfo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {repoInfo.topics.slice(0, 6).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-xl transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
            style={{ color: 'var(--subtle)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Repo Stats Row */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-3 text-xs" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          {repoInfo.language && (
            <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[repoInfo.language] || 'var(--accent)' }} />
              {repoInfo.language}
            </span>
          )}
          <span className="flex items-center gap-1" style={{ color: 'var(--warning)' }}>
            <Star size={12} /> {(repoInfo.stars ?? repo.stars)?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <GitFork size={12} /> {(repoInfo.forks ?? repo.forks)?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <Eye size={12} /> {repoInfo.watchers?.toLocaleString?.() ?? '—'}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--danger)' }}>
            <AlertCircle size={12} /> {repoInfo.openIssues ?? '—'} issues
          </span>
          {repoInfo.defaultBranch && (
            <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              <GitBranch size={12} /> {repoInfo.defaultBranch}
            </span>
          )}
          {repoInfo.license && (
            <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              <Package size={12} /> {repoInfo.license}
            </span>
          )}
          <a
            href={repoInfo.url || repo.url}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1 ml-auto"
            style={{ color: 'var(--accent)' }}
          >
            View on GitHub <ExternalLink size={11} />
          </a>
        </div>

        {/* Commits List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider" style={{ color: 'var(--muted)' }}>COMMIT HISTORY</h3>
            {repoInfo.updatedAt && (
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                Updated {formatDistanceToNow(new Date(repoInfo.updatedAt), { addSuffix: true })}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--subtle)' }}>
              <GitCommit size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No commits found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {commits.map((commit, i) => (
                <a
                  key={commit.fullSha || i}
                  href={commit.url}
                  target="_blank" rel="noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl transition-all group"
                  style={{ textDecoration: 'none', border: '1px solid transparent' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {commit.authorAvatar ? (
                    <img src={commit.authorAvatar} alt={commit.author} className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
                      <GitCommit size={12} style={{ color: 'var(--accent)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{commit.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--subtle)' }}>
                      <span>{commit.authorLogin || commit.author}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {commit.date ? formatDistanceToNow(new Date(commit.date), { addSuffix: true }) : '—'}
                      </span>
                    </div>
                  </div>
                  <code
                    className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ background: 'var(--surface-3)', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {commit.sha}
                  </code>
                </a>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(commits.length === 20 || page > 1) && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                <ChevronLeft size={14} /> Newer
              </button>
              <span className="text-sm" style={{ color: 'var(--subtle)' }}>Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={commits.length < 20}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Older <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GitHubPage() {
  const [inputUsername, setInputUsername] = useState('');
  const [lookupUsername, setLookupUsername] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoFilter, setRepoFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'stars' | 'name'

  const { data: profileData, isLoading: profileLoading, isError } = useQuery({
    queryKey: ['github', 'public', 'profile', lookupUsername],
    queryFn: () => githubService.getProfileByUsername(lookupUsername).then(r => r.data.data),
    enabled: !!lookupUsername,
    retry: false,
    onError: () => toast.error('GitHub user not found'),
  });

  const { data: reposData, isLoading: reposLoading } = useQuery({
    queryKey: ['github', 'public', 'repos', lookupUsername],
    queryFn: () => githubService.getReposByUsername(lookupUsername).then(r => r.data.data),
    enabled: !!lookupUsername && !!profileData,
  });

  const handleLookup = () => {
    const v = inputUsername.trim();
    if (!v) return toast.error('Enter a GitHub username');
    if (v === lookupUsername) return;
    setLookupUsername(v);
    setSelectedRepo(null);
    setRepoFilter('');
  };

  const handleClear = () => {
    setInputUsername('');
    setLookupUsername('');
    setSelectedRepo(null);
  };

  // Filter + sort repos
  const allRepos = reposData?.repos || [];
  const filteredRepos = allRepos
    .filter(r => r.name.toLowerCase().includes(repoFilter.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(repoFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  // ── Not searched yet ────────────────────────────────────────────────────────
  if (!lookupUsername) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center max-w-md animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-panel)' }}
          >
            <Github size={40} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>GitHub Profile Lookup</h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--subtle)' }}>
            Enter any GitHub username to explore their profile, repositories, languages, and full commit history.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              value={inputUsername}
              onChange={e => setInputUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. torvalds"
              className="input flex-1"
              autoFocus
            />
            <button
              onClick={handleLookup}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
            >
              <Link2 size={16} /> Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-64 rounded-xl mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-48 rounded-xl mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (isError || !profileData) {
    return (
      <div className="p-8">
        {/* Search bar stays visible */}
        <div className="flex gap-2 max-w-sm mb-8">
          <input value={inputUsername} onChange={e => setInputUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLookup()} placeholder="GitHub username" className="input flex-1" />
          <button onClick={handleLookup} className="btn-primary text-sm"><Link2 size={14} /> Search</button>
          <button onClick={handleClear} className="btn-ghost text-sm"><Unlink size={14} /></button>
        </div>
        <div className="text-center py-20" style={{ color: 'var(--subtle)' }}>
          <Github size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold" style={{ color: 'var(--muted)' }}>User not found</p>
          <p className="text-sm mt-1">No GitHub user with username <code style={{ color: 'var(--accent)' }}>@{lookupUsername}</code></p>
        </div>
      </div>
    );
  }

  // ── Profile Loaded ──────────────────────────────────────────────────────────
  const totalStars = allRepos.reduce((s, r) => s + (r.stars || 0), 0);

  return (
    <div className="p-8">
      {/* Search Bar */}
      <div className="flex gap-2 max-w-sm mb-8">
        <input
          value={inputUsername}
          onChange={e => setInputUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="GitHub username"
          className="input flex-1"
        />
        <button onClick={handleLookup} className="btn-primary text-sm flex items-center gap-1.5">
          <Link2 size={14} /> Search
        </button>
        <button onClick={handleClear} className="btn-ghost text-sm flex items-center gap-1.5">
          <Unlink size={14} />
        </button>
      </div>

      {/* Profile Header */}
      <div className="rounded-2xl p-6 mb-6 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start gap-5 flex-wrap">
          <img
            src={profileData.avatarUrl}
            alt={profileData.username}
            className="w-20 h-20 rounded-2xl flex-shrink-0"
            style={{ border: '2px solid var(--accent-border)' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {profileData.name || profileData.username}
              </h1>
              <code className="text-sm px-2.5 py-0.5 rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                @{profileData.username}
              </code>
            </div>
            {profileData.bio && (
              <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{profileData.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--subtle)' }}>
              {profileData.company && (
                <span className="flex items-center gap-1"><Building2 size={12} />{profileData.company}</span>
              )}
              {profileData.location && (
                <span className="flex items-center gap-1"><MapPin size={12} />{profileData.location}</span>
              )}
              {profileData.blog && (
                <a href={profileData.blog.startsWith('http') ? profileData.blog : `https://${profileData.blog}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 hover:underline" style={{ color: 'var(--accent)' }}>
                  <Globe size={12} />{profileData.blog}
                </a>
              )}
              {profileData.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> Joined {format(new Date(profileData.createdAt), 'MMM yyyy')}
                </span>
              )}
            </div>
          </div>
          <a
            href={profileData.profileUrl}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
          >
            <ExternalLink size={14} /> View Profile
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
        <StatCard icon={BookOpen} value={profileData.publicRepos} label="Public Repos" color="var(--accent)" />
        <StatCard icon={Users} value={profileData.followers} label="Followers" color="var(--success)" />
        <StatCard icon={Hash} value={profileData.following} label="Following" color="#3178c6" />
        <StatCard icon={Star} value={totalStars} label="Total Stars" color="var(--warning)" />
      </div>

      {/* Language Stats */}
      {allRepos.length > 0 && (
        <div className="rounded-2xl p-6 mb-6 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-xs tracking-wider mb-4" style={{ color: 'var(--muted)' }}>LANGUAGE DISTRIBUTION</h3>
          <LanguageBar repos={allRepos} />
        </div>
      )}

      {/* Repos Section */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-xs tracking-wider" style={{ color: 'var(--muted)' }}>
            REPOSITORIES ({filteredRepos.length})
          </h3>
          <div className="flex gap-2">
            <input
              value={repoFilter}
              onChange={e => setRepoFilter(e.target.value)}
              placeholder="Filter repos..."
              className="input text-sm py-1.5 px-3"
              style={{ maxWidth: '180px', minWidth: '0' }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input text-sm py-1.5 px-3"
              style={{ maxWidth: '130px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="updated">Last Updated</option>
              <option value="stars">Most Stars</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {reposLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--subtle)' }}>
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No repos match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map(repo => (
              <RepoCard key={repo.name} repo={repo} onClick={setSelectedRepo} />
            ))}
          </div>
        )}
      </div>

      {/* Repo Detail Modal */}
      {selectedRepo && (
        <RepoModal
          repo={selectedRepo}
          username={lookupUsername}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}
