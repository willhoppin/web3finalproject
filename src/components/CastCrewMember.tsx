import React, { useState } from 'react';

interface CastCrewMember {
  name: string;
  points: number;
  walletAddress: string;
}

const projectTypes = ["Feature Film", "Animated Film", "Documentary", "Short Film"];
const genres = ["Drama", "Comedy", "Horror", "Science Fiction", "Thriller", "Family"];
const distributionMethods = ["Netflix", "Apple TV", "Youtube"];
const primaryDistributionMethods = ["Theatrical Release", "Streaming", "TV Broadcast"];

export default function CreateMovieForm() {
  const [typeOfProject, setTypeOfProject] = useState("");
  const [genre, setGenre] = useState("");
  const [distribution, setDistribution] = useState<string[]>([]);
  const [primaryDistributionMethod, setPrimaryDistributionMethod] = useState("");
  const [budget, setBudget] = useState("");
  const [cast, setCast] = useState<CastCrewMember[]>([{ name: '', points: 0, walletAddress: '' }]);
  const [crew, setCrew] = useState<CastCrewMember[]>([{ name: '', points: 0, walletAddress: '' }]);

  const handleDistributionChange = (method: string) => {
    if (distribution.includes(method)) {
      setDistribution(distribution.filter(item => item !== method));
    } else {
      setDistribution([...distribution, method]);
    }
  };

  const handleAddMember = (type: 'cast' | 'crew') => {
    const newMember = { name: '', points: 0, walletAddress: '' };
    if (type === 'cast') {
      setCast([...cast, newMember]);
    } else {
      setCrew([...crew, newMember]);
    }
  };

  const handleRemoveMember = (index: number, type: 'cast' | 'crew') => {
    if (type === 'cast') {
      setCast(cast.filter((_, i) => i !== index));
    } else {
      setCrew(crew.filter((_, i) => i !== index));
    }
  };

  const handleMemberStringChange = (
    index: number,
    type: 'cast' | 'crew',
    key: 'name' | 'walletAddress',
    value: string
  ) => {
    const updatedMembers = type === 'cast' ? [...cast] : [...crew];
    updatedMembers[index][key] = value;
    type === 'cast' ? setCast(updatedMembers) : setCrew(updatedMembers);
  };
  
  const handleMemberNumberChange = (
    index: number,
    type: 'cast' | 'crew',
    key: 'points',
    value: number
  ) => {
    const updatedMembers = type === 'cast' ? [...cast] : [...crew];
    updatedMembers[index][key] = value;
    type === 'cast' ? setCast(updatedMembers) : setCrew(updatedMembers);
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={typeOfProject} onChange={e => setTypeOfProject(e.target.value)}>
        <option value="">Select Project Type</option>
        {projectTypes.map(type => <option key={type} value={type}>{type}</option>)}
      </select>

      <select value={genre} onChange={e => setGenre(e.target.value)}>
        <option value="">Select Genre</option>
        {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
      </select>

      {distributionMethods.map(method => (
        <label key={method}>
          <input
            type="checkbox"
            checked={distribution.includes(method)}
            onChange={() => handleDistributionChange(method)}
          />
          {method}
        </label>
      ))}

      <select value={primaryDistributionMethod} onChange={e => setPrimaryDistributionMethod(e.target.value)}>
        <option value="">Select Primary Distribution Method</option>
        {primaryDistributionMethods.map(method => <option key={method} value={method}>{method}</option>)}
      </select>

      <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Budget" />

      <div>
        <h3>Cast</h3>
        {cast.map((member, index) => (
          <div key={index}>
            <input
              type="text"
              value={member.name}
              onChange={e => handleMemberStringChange(index, 'cast', 'name', e.target.value)}
              placeholder="Name"
            />
            <input
              type="number"
              value={member.points}
              onChange={e => handleMemberNumberChange(index, 'cast', 'points', Number(e.target.value))}
              placeholder="Points"
            />
            <input
              type="text"
              value={member.walletAddress}
              onChange={e => handleMemberStringChange(index, 'cast', 'walletAddress', e.target.value)}
              placeholder="Wallet Address"
            />
            {cast.length > 1 && (
              <button type="button" onClick={() => handleRemoveMember(index, 'cast')}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddMember('cast')}>Add Cast Member</button>
      </div>


      <div>
        <h3>Crew</h3>
        {crew.map((member, index) => (
          <div key={index}>
            <input
              type="text"
              value={member.name}
              onChange={e => handleMemberStringChange(index, 'crew', 'name', e.target.value)}
              placeholder="Name"
            />
            <input
              type="number"
              value={member.points}
              onChange={e => handleMemberNumberChange(index, 'crew', 'points', Number(e.target.value))}
              placeholder="Points"
            />
            <input
              type="text"
              value={member.walletAddress}
              onChange={e => handleMemberStringChange(index, 'crew', 'walletAddress', e.target.value)}
              placeholder="Wallet Address"
            />
            {crew.length > 1 && (
              <button type="button" onClick={() => handleRemoveMember(index, 'crew')}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddMember('crew')}>Add Crew Member</button>
      </div>


      <button type="submit">Create Movie</button>
    </form>
  );
}
