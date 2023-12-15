'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import mockData from '../../mockdata.json'; // Importing the mock data

interface Payment {
  name: string;
  amount: number;
}

interface DailyPayment {
  date: string;
  payments: Payment[];
}

interface CastAndCrewMember {
  name: string;
  points: number;
  walletAddress: string;
}

interface Movie {
  projectName: string;
  photoExtension: string;
  projectType: string;
  genre: string;
  budget: number;
  generateReceiptsWalletID: string;
  appleTVProjectID: string;
  netflixProjectID: string;
  primeVideoProjectID: string;
  huluProjectID: string;
  youtubeProjectLink: string;
  nbcProjectID: string;
  castAndCrew: CastAndCrewMember[];
  dailyResidualPayments: DailyPayment[];
}


export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showCreateMovieForm, setShowCreateMovieForm] = useState(false);
  const [newMovie, setNewMovie] = useState<Movie | null>(null);

  const calculateTotalResiduals = (dailyResidualPayments: DailyPayment[]) => {
    return dailyResidualPayments.reduce((total, day) => (
      total + day.payments.reduce((dayTotal: number, payment) => dayTotal + payment.amount, 0)
    ), 0);
  };

  const calculateIndividualPayment = (name: string) => {
    let totalPayment = 0;
    selectedMovie?.dailyResidualPayments.forEach(day => {
      day.payments.forEach(payment => {
        if (payment.name === name) {
          totalPayment += payment.amount;
        }
      });
    });
    return totalPayment;
  };

  const handleCreateMovie = (movie: Movie) => {
    // Here you would send the movie to your backend to be added to the JSON file
    mockData.push(movie); // Adding to the existing data for demo purposes
    setShowCreateMovieForm(false);
  };

  const handleNewMovieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const name = e.target.name;
  
    setNewMovie({
      ...newMovie,
      [name]: value
    } as Movie);
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMovie) {
      handleCreateMovie(newMovie);
      setNewMovie(null);
    }
  };

  if (showCreateMovieForm) {
    return (
      <div className="bg-white text-black">
        <h2>New Movie</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="text" name="projectName" placeholder="Project Name" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Photo Extension" onChange={(event) => handleNewMovieChange(event)} required />

          {/* Additional Fields */}
          <select name="typeOfProject" onChange={(event) => handleNewMovieChange(event)} required>
            {/* Options for type of project */}
          </select>
          <select name="genre" onChange={(event) => handleNewMovieChange(event)} required>
            {/* Options for genre */}
          </select>
          <div>
            {/* Distribution methods as checkboxes */}
          </div>
          <select name="primaryDistributionMethod" onChange={(event) => handleNewMovieChange(event)} required>
            {/* Options for primary distribution method */}
          </select>
          <input type="number" name="budget" placeholder="Budget" onChange={(event) => handleNewMovieChange(event)} required />

          {/* Dynamic Fields for Cast */}
          <div id="castContainer" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Fields for each cast member */}
          </div>
          <button type="button" onClick={addCastMember}>Add Cast Member</button>

          {/* Dynamic Fields for Crew */}
          <div id="crewContainer" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Fields for each crew member */}
          </div>
          <button type="button" onClick={addCrewMember}>Add Crew Member</button>

          <button type="submit">Create Movie</button>
        </form>
        <button onClick={() => setShowCreateMovieForm(false)}>Cancel</button>
      </div>
    );
}


// Placeholder functions for adding cast and crew members
function addCastMember() {
    // Your logic to add a new cast member field
}

function addCrewMember() {
    // Your logic to add a new crew member field
}



  if (selectedMovie) {
    // Displaying selected movie details
    return (
      <div className="text-gray-800 bg-white p-24">
        <h1 className="text-4xl font-bold mb-5">{selectedMovie.projectName}</h1>
        <div>
          <Image
            src={`/images/${selectedMovie.photoExtension}.png`}
            alt={selectedMovie.projectName}
            width={200}
            height={200}
          />
        </div>
        <h2 className="text-2xl font-bold mt-4">Cast & Crew</h2>
        <ul>
          {selectedMovie.castAndCrew.map(member => (
            <li key={member.walletAddress}>
              {member.name} - Points: {member.points} - Wallet: {member.walletAddress}
            </li>
          ))}
        </ul>
        <h2 className="text-2xl font-bold mt-4">Residual Payments To Date</h2>
        <ul>
          {selectedMovie.dailyResidualPayments.map(day => (
            <li key={day.date}>
              <strong>{day.date}</strong> - Total Payments: {calculateTotalResiduals([day])} ETH
              <ul>
                {day.payments.map(payment => (
                  <li key={payment.name}>
                    {payment.name} - {payment.amount} ETH
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button onClick={() => setSelectedMovie(null)} className="mt-5 bg-gray-200 py-2 px-4 rounded hover:bg-gray-300">
          Back
        </button>
      </div>
    );
  }
  

  return (
    <main className="flex min-h-screen flex-col justify-between px-24 pb-24 text-gray-800 bg-white">
      <Image
        src={"/images/logo.png"}
        alt="logo"
        width={220}
        height={100}
        className="mb-16 mt-10"
      />
      <button onClick={() => setShowCreateMovieForm(true)} className="mb-5 bg-blue-500 py-2 px-4 text-white rounded hover:bg-blue-600">
        Create New Project
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockData.map((movie: Movie) => (
          <div key={movie.projectName} className="rounded-lg border border-gray-300 p-4 hover:border-gray-400 hover:shadow-lg cursor-pointer" onClick={() => setSelectedMovie(movie)}>
            <h2 className="text-2xl font-semibold mb-2">{movie.projectName}</h2>
            <Image
              src={`/images/${movie.photoExtension}.png`}
              alt={movie.projectName}
              width={100}
              height={100}
              className="rounded-xl mb-2"
            />
            <p>Total Paid: {calculateTotalResiduals(movie.dailyResidualPayments).toLocaleString()} ETH</p>
            {/* Add additional movie details here as needed */}
          </div>
        ))}
      </div>
    </main>
  );  
}
