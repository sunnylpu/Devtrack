import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { githubService } from '../services';
import { RepoList, CommitList } from '../components/github/GitHubWidgets';
import toast from 'react-hot-toast';
import { Code2, ExternalLink, Link2, Loader2, Unlink } from 'lucide-react';

export default function GitHubLookupPage() {
  const [inputUsername, setInputUsername] = useState('');
  const [lookupUsername, setLookupUsername] = useState('');

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['github', 'public', 'profile', lookupUsername],
    queryFn: () => githubService.getProfileByUsername(lookupUsername).then(r => r.data.data),
    enabled: !!lookupUsername,
    onError: (err) => toast.error(err.response?.data?.message || 'GitHub user not found'),
  });

  const { data: reposData } = useQuery({
    queryKey: ['github', 'public', 'repos', lookupUsername],
    queryFn: () => githubService.getReposByUsername(lookupUsername).then(r => r.data.data),
    enabled: !!lookupUsername,
  });

  const { data: recentData } = useQuery({
    queryKey: ['github', 'public', 'recent', lookupUsername],
    queryFn: () => githubService.getRecentByUsername(lookupUsername).then(r => r.data.data),
    enabled: !!lookupUsername,
  });

  const handleLookup = () => {
    const v = inputUsername.trim();
    if (!v) return toast.error('Enter a GitHub username');
    setLookupUsername(v);
  };

  const handleClear = () => {
    setInputUsername('');
    setLookupUsername('');
  };

  if (profileLoading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 max-w-xl">
        <h2 className="text-2xl font-bold mb-2">Lookup GitHub by Username</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--subtle)' }}>Enter any public GitHub username to fetch profile, repos and recent commits.</p>
        <div className="flex gap-2">
          <input
            value={inputUsername}
            onChange={e => setInputUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="e.g. octocat"
            className="input flex-1"
          />
          <button onClick={handleLookup} className="px-5 py-2 rounded-xl flex items-center gap-2" style={{ background: 'var(--accent)', color: 'white' }}>
            <Link2 size={16} /> Lookup
          </button>
          <button onClick={handleClear} className="px-4 py-2 rounded-xl flex items-center gap-2" style={{ background: 'var(--surface-2)' }}>
            <Unlink size={14} /> Clear
          </button>
        </div>
      </div>

      {profileData && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {profileData.avatarUrl && <img src={profileData.avatarUrl} className="w-16 h-16 rounded-full" alt={profileData.username} />}
            <div>
              <h3 className="text-xl font-semibold">{profileData.name || profileData.username} <span className="text-sm" style={{ color: 'var(--subtle)' }}>on GitHub</span></h3>
              <a href={profileData.profileUrl} target="_blank" rel="noreferrer" className="text-sm" style={{ color: 'var(--accent)' }}>View Profile <ExternalLink size={12} /></a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h4 className="font-semibold mb-3">Top Repos</h4>
              <RepoList repos={reposData?.repos || []} />
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h4 className="font-semibold mb-3">Recent Commits</h4>
              <CommitList commits={recentData?.recentCommits || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
