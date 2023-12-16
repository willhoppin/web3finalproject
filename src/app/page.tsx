'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react";
import mockData from '../../mockdata.json'; // Importing the mock data
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATNt-j2Xd9xinTWFO8xUyQ8oo5eMhMS0I",
  authDomain: "streamchain-d3d99.firebaseapp.com",
  projectId: "streamchain-d3d99",
  storageBucket: "streamchain-d3d99.appspot.com",
  messagingSenderId: "425791006395",
  appId: "1:425791006395:web:f279473bcdf3e258646b9e",
  measurementId: "G-CCBBNSPQML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  photoUrl: string;
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
  const initialCastMember = { name: '', points: 0, walletAddress: '' }; // Default cast member
  const [castMembers, setCastMembers] = useState<CastAndCrewMember[]>([initialCastMember]);
  const [crewMembers, setCrewMembers] = useState<CastAndCrewMember[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const querySnapshot = await getDocs(collection(db, "movies"));
      const moviesArray: Movie[] = []; 
      querySnapshot.forEach((doc: DocumentData) => {
        // Ensure that the data structure from Firestore matches your Movie interface
        moviesArray.push({ id: doc.id, ...doc.data() } as Movie);
      });
      setMovies(moviesArray);
    };

    fetchMovies();
  }, []);

  const addCrewMember = () => {
    const newCrewMember = { name: '', points: 0, walletAddress: '' };
    setCrewMembers([...crewMembers, newCrewMember]);
  };


  const calculateTotalResiduals = (dailyResidualPayments: DailyPayment[]) => {
    return dailyResidualPayments.reduce((total, day) => (
      total + day.payments.reduce((dayTotal: number, payment) => dayTotal + payment.amount, 0)
    ), 0);
  };

  const addCastMember = () => {
    const newCastMember = { name: '', points: 0, walletAddress: '' };
    setCastMembers([...castMembers, newCastMember]);
  };

  const handleCastMemberChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCastMembers = [...castMembers];
    updatedCastMembers[index] = {
      ...updatedCastMembers[index],
      [event.target.name]: event.target.value
    };
    setCastMembers(updatedCastMembers);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMovie) {
      const movieToSubmit = {
        ...newMovie,
        castAndCrew: castMembers,  // Ensure all required fields are included
        // Add other necessary fields from the form
      };
      handleCreateMovie(movieToSubmit as Movie);
    }
  };
  
  const handleCreateMovie = async (movie: Movie) => {
    try {
      await addDoc(collection(db, "movies"), movie);
      // After successful addition, fetch movies again or update the state
      setShowCreateMovieForm(false);  // Close the form
      setNewMovie(null);  // Reset form fields
    } catch (error) {
      console.error("Error adding movie: ", error);
      // Handle error (e.g., show an error message to the user)
    }
  };
  
  

  const handleNewMovieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const name = e.target.name;
  
    setNewMovie({
      ...newMovie,
      [name]: value
    } as Movie);
  };

  if (showCreateMovieForm) {
    return (
      <div className="bg-white text-black p-24">
        <button className="mb-4 py-2 px-4 border rounded-lg bg-gray-400 text-white" onClick={() => setShowCreateMovieForm(false)}>Back</button>
        <h2 className="text-blue-500 font-bold text-xl">Create New Project</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input type="text" name="projectName" placeholder="Project Name" className="p-2 border rounded-lg mb-2 mt-4" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Photo URL" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="number" name="photoExtension" placeholder="Budget (USD)" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />

          {/* Additional Fields */}
          <select name="typeOfProject" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required>
            <option value="">Select Film Type</option>
            <option value="featureFilm">Feature Film</option>
            <option value="featureDoc">Feature Documentary</option>
            <option value="docSeries">Documentary Series</option>
            <option value="tvSeries">TV Series</option>
            <option value="shortFilm">Short Film</option>
            <option value="tvMovie">TV Movie</option>
          </select>

          <select name="genre" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required>
            <option value="">Select Genre</option>
            <option value="western">Western</option>
            <option value="sciFi">Sci-Fi</option>
            <option value="horror">Horror</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="romance">Romance</option>
            <option value="adventure">Adventure</option>
            <option value="drama">Drama</option>
            <option value="other">Other</option>
          </select>

          <h2 className="text-blue-500 mt-8 font-bold text-xl">Distribution Info</h2>
          <input type="text" name="photoExtension" placeholder="General Receipts ETH Wallet ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Apple TV Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Netflix Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Prime Video Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Hulu Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="YouTube Link" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="photoExtension" placeholder="Cable (Broadcast) Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />

          <select name="genre" className="p-2 border rounded-lg my-2" required>
            <option value="">Select a Primary Distribution Method</option>
            <option value="western">Western</option>
            <option value="sciFi">Sci-Fi</option>
            <option value="horror">Horror</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="romance">Romance</option>
            <option value="adventure">Adventure</option>
            <option value="drama">Drama</option>
            <option value="other">Other</option>
          </select>

          {/* Dynamic Fields for Cast */}
          <h2 className="text-blue-500 mt-8 mb-2 font-bold text-xl">Cast Members</h2>
          <div id="castContainer" className="flex flex-col">
            {castMembers.map((member, index) => (
              <div key={index} className="flex flex-col mb-6">
                <input type="text" name="name" placeholder="Name" className="p-2 border rounded-lg mb-2" value={member.name} onChange={(event) => handleCastMemberChange(index, event)} required />
                <input type="number" name="points" placeholder="Points" className="p-2 border rounded-lg mb-2" value={member.points} onChange={(event) => handleCastMemberChange(index, event)} required />
                <input type="text" name="walletAddress" placeholder="ETH Wallet Address" className="p-2 border rounded-lg" value={member.walletAddress} onChange={(event) => handleCastMemberChange(index, event)} required />
              </div>
            ))}
            <button type="button" className="my-2 p-2 border rounded-lg bg-blue-500 text-white" onClick={addCastMember}>Add Cast Member</button>
          </div>

          <button type="submit" className="my-2 p-2 border rounded-lg bg-green-500 text-white">Create Movie</button>
        </form>
        <button className="mt-4 px-4 py-2 border rounded-lg bg-red-500 text-white" onClick={() => setShowCreateMovieForm(false)}>Cancel</button>
      </div>
    );
}


  if (selectedMovie) {
    // Displaying selected movie details
    return (
      <div className="text-gray-800 bg-white p-24">
        <h1 className="text-4xl font-bold mb-5">{selectedMovie.projectName}</h1>
        <div>
          <Image
            src={selectedMovie.photoUrl}
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
        <h2 className="text-2xl font-bold mt-4">Residual Payments</h2>
        <h2 className="italic font-bold mt-4">NOTE: ADD STUFF HERE FROM CHAIN...</h2>
        {/* Dynamic Fields for Cast 
        <ul>
          {selectedMovie.dailyResidualPayments.map(day => (
            <li key={day.date}>
              <strong>As of {day.date}</strong> - Total Payments: {calculateTotalResiduals([day])} ETH
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
        */}
        <button onClick={() => setSelectedMovie(null)} className="mt-5 bg-gray-200 py-2 px-4 rounded hover:bg-gray-300">
          Back
        </button>
      </div>
    );
  }
  

  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain="ethereum"
    >
      <main className="flex min-h-screen flex-col px-24 pb-24 text-gray-800 bg-white">
        <div className="flex justify-between mb-16 mt-10">
          <Image
            src={"/images/logo.png"}
            alt="logo"
            width={400}
            height={100}
          />
          <ConnectWallet className="" theme="dark" />
        </div>
        <button onClick={() => setShowCreateMovieForm(true)} className="mb-5 bg-blue-500 py-2 px-4 text-white rounded hover:bg-blue-600">
          Create New Project
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div key={movie.projectName} className="rounded-lg border border-gray-300 p-4 hover:border-gray-400 hover:shadow-lg cursor-pointer" onClick={() => setSelectedMovie(movie)}>
              <h2 className="text-2xl font-semibold mb-2">{movie.projectName}</h2>
              <Image
                src={movie.photoUrl}
                alt={movie.projectName}
                width={100}
                height={100}
                className="rounded-xl mb-2"
              />
              <p>Total Paid: 0 ETH</p>
            </div>
          ))}
        </div>
      </main>
    </ThirdwebProvider>
  );  
}
