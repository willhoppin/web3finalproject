'use client';
import { ethers, Contract } from 'ethers';
import contractABI from '../../abi.json'; // Path to your contract's ABI
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react";
import mockData from '../../mockdata.json'; // Importing the mock data
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import { useAddress } from '@thirdweb-dev/react';

const CONTRACT_ADDRESS = '0x518fbcfb83832ff840c73f1f572937fe7b95ed4e';

const acceptedDomains = [
  'm.media-amazon.com',
  'i.ebayimg.com',
  'cdn.shopify.com',
  'images.unsplash.com',
  's3.amazonaws.com',
  'cdn.sanity.io',
  'files.wordpress.com',
  'lh3.googleusercontent.com',
  'media.giphy.com',
  'i.imgur.com',
  'pbs.twimg.com',
  'cdn.pixabay.com',
  'upload.wikimedia.org',
  'cdn.vox-cdn.com',
  'static1.squarespace.com',
  'static.flickr.com',
  'media-exp1.licdn.com',
  'assets.website-files.com',
  'images.squarespace-cdn.com',
  'media-prod.fangoria.com',
  'i.etsystatic.com'
];

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
  owner: string;
  budget: number;
  generateReceiptsWalletID: string;
  appleTVProjectID: string;
  primaryDistMethod: string;
  netflixProjectID: string;
  primeVideoProjectID: string;
  huluProjectID: string;
  youtubeProjectLink: string;
  nbcProjectID: string;
  castAndCrew: CastAndCrewMember[];
  dailyResidualPayments: DailyPayment[];
}

function isDomainAllowed(url: string) {
  try {
    const domain = new URL(url).hostname;
    return acceptedDomains.includes(domain);
  } catch (error) {
    return false;
  }
}

function AppContent() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showCreateMovieForm, setShowCreateMovieForm] = useState(false);
  const [newMovie, setNewMovie] = useState<Movie | null>(null);
  const initialCastMember = { name: '', points: 0, walletAddress: '' }; // Default cast member
  const [castMembers, setCastMembers] = useState<CastAndCrewMember[]>([initialCastMember]);
  const [crewMembers, setCrewMembers] = useState<CastAndCrewMember[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const walletAddress = useAddress();
  const [contract, setContract] = useState<Contract | null>(null);
  const [balance, setBalance] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountIndex, setAccountIndex] = useState(0); // You can set the default index here
  const [memberBalances, setMemberBalances] = useState({});


  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

  const renderImage = (url: string, alt: string, width: number, height: number) => {
    if (isDomainAllowed(url)) {
      return <Image src={url} alt={alt} width={width} height={height} />;
    } else {
      return <p>Unsupported image domain</p>;
    }
  };

  // Function to fetch balances
  const fetchMemberBalances = async (members: CastAndCrewMember[]) => {
    const balances: Record<string, string> = {};  // Object with string keys and string values
    for (const member of members) {
      try {
        // Ensure walletAddress is a valid index. If not, set balance to '0'
        const index = Number(member.walletAddress);
        if (isNaN(index) || index < 0 || index >= accounts.length) {
          balances[member.walletAddress] = '0';
          continue;
        }

        const address = accounts[index];
        const balanceWei = await provider.getBalance(address);
        // Subtract 1000 ether (converted to wei) from the balance
        const adjustedBalanceWei = balanceWei.sub(ethers.utils.parseEther("1000"));
        balances[member.walletAddress] = ethers.utils.formatEther(adjustedBalanceWei);
      } catch (error) {
        console.error('Error fetching balance for address', member.walletAddress, error);
        balances[member.walletAddress] = 'Error';
      }
    }
    setMemberBalances(balances);
  };
  

  // useEffect to call fetchMemberBalances when selectedMovie changes
  useEffect(() => {
    if (selectedMovie && selectedMovie.castAndCrew) {
      fetchMemberBalances(selectedMovie.castAndCrew);
    }
  }, [selectedMovie, accounts, provider]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider) return;
  
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > accountIndex) {
          const selectedAccount = accounts[accountIndex];
          const balance = await provider.getBalance(selectedAccount);
          setBalance(ethers.utils.formatEther(balance));
        } else {
          console.error('Account index out of range');
          setBalance("Error");
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance("Error");
      }
    };
  
    fetchBalance();
  }, [provider, accountIndex]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!provider) return;
      try {
        const fetchedAccounts = await provider.listAccounts();
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
  
    fetchAccounts();
  }, [provider]);  

  useEffect(() => {
    const initializeContract = async () => {
      try {
        // Create a provider for Ganache
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    
        // Create a contract instance
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider.getSigner());
    
        // Set the contract instance
        setContract(contractInstance);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };
  
    initializeContract();
  }, []);

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
  }, [walletAddress]); // Add walletAddress as a dependency

  const prevWalletAddressRef = useRef(walletAddress);

  useEffect(() => {
    // Check if the wallet address changed from a defined state (not on initial mount)
    if (prevWalletAddressRef.current !== undefined && prevWalletAddressRef.current !== walletAddress) {
      window.location.reload();
    }
    prevWalletAddressRef.current = walletAddress;
  }, [walletAddress]);

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
        castAndCrew: castMembers,
        owner: walletAddress
      };
      handleCreateMovie(movieToSubmit as Movie);
    }
    window.location.reload()
  };

  const hitContract = async () => {
    if (contract) {
      try {
        const result = await contract.movieStudio();
        console.log('Contract response:', result);
        // Handle the result here (e.g., displaying it in the UI)
      } catch (error) {
        console.error('Error interacting with contract:', error);
      }
    } else {
      console.log('Contract not initialized');
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
          <input type="text" name="photoUrl" placeholder="Photo URL (Wikipedia, Amazon, and most image domains supported)" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="number" name="budget" placeholder="Budget (USD)" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />

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
          <input type="text" name="generalReceiptsWalletID" placeholder="General Receipts ETH Wallet ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="appleTVProjectID" placeholder="Apple TV Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="netflixProjectID" placeholder="Netflix Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="primeVideoProjectID" placeholder="Prime Video Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="huluProjectID" placeholder="Hulu Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="youtubeProjectLink" placeholder="YouTube Link" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />
          <input type="text" name="nbcProjectID" placeholder="Cable (Broadcast) Project ID" className="p-2 border rounded-lg my-2" onChange={(event) => handleNewMovieChange(event)} required />

          <select name="primaryDistMethod" className="p-2 border rounded-lg my-2" required>
            <option value="">Select a Primary Distribution Method</option>
            <option value="western">Streaming</option>
            <option value="sciFi">Theatrical</option>
            <option value="horror">Online Rental</option>
            <option value="action">Cable</option>
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
          {renderImage(selectedMovie.photoUrl, selectedMovie.projectName, 200, 200)}
        </div>
        <h2 className="text-2xl font-bold mt-4">Cast & Crew</h2>
        <ul>
          {selectedMovie.castAndCrew.map((member, index) => (
            <li key={index}>
              {member.name} - Wallet: {accounts[Number(member.walletAddress)] || 'Address not found'} - <span className="font-bold">Paid: {memberBalances[member.walletAddress] || 'Loading...'} ETH to Date</span>
            </li>
          ))}
        </ul>
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

        {walletAddress ? (
          <>
            {/* 
            <button 
              onClick={hitContract} 
              className="my-2 bg-purple-500 py-2 px-4 text-white rounded hover:bg-purple-600"
            >
              Hit Contract
            </button>
            */}
            <button onClick={() => setShowCreateMovieForm(true)} className="mb-5 bg-blue-500 py-2 px-4 text-white rounded hover:bg-blue-600">
              Create New Project
            </button>
            
            {movies.some(movie => movie.owner === walletAddress) && (
              <>
                <h2 className="text-blue-500 font-bold text-xl mt-10 mb-4">Your Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movies.filter(movie => movie.owner === walletAddress).map((movie) => (
                    <div
                      key={movie.projectName}
                      className="rounded-lg border border-blue-500 p-4 hover:border-gray-400 hover:shadow-lg cursor-pointer"
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <h2 className="text-2xl font-semibold mb-2">{movie.projectName}</h2>
                      {renderImage(movie.photoUrl, movie.projectName, 100, 100)}
                      <p className="mt-2">Total Paid: 0 ETH</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="text-blue-500 font-bold text-xl mt-10 mb-4">Global Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.filter(movie => movie.owner !== walletAddress).map((movie) => (
                <div
                  key={movie.projectName}
                  className="rounded-lg border border-blue-500 p-4 hover:border-gray-400 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <h2 className="text-2xl font-semibold mb-2">{movie.projectName}</h2>
                  {renderImage(movie.photoUrl, movie.projectName, 100, 100)}
                  <p className="mt-2">Total Paid: 0 ETH</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <h2 className="text-blue-500 italic text-xl mt-10 mb-4">Connect an ETH wallet above to get started! On certain browsers, you may have to reload the page after you sign in.</h2>
        )}
      </main>

    </ThirdwebProvider>
  );
}


export default function Home() {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain="ethereum"
    >
      <AppContent />
    </ThirdwebProvider>
  );
}
