import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Using mock data only, no API imports needed

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock team data in case API fails
  const mockTeams = [
    {
      id: 1,
      name: 'India',
      shortname: 'IND',
      logo: 'https://placehold.co/400x300/blue/white?text=India+Team',
      ranking: 2,
      captain: 'Rohit Sharma',
      coach: 'Rahul Dravid',
      matches: 578,
      worldCups: 2
    },
    {
      id: 2,
      name: 'Australia',
      shortname: 'AUS',
      logo: 'https://placehold.co/400x300/yellow/black?text=Australia+Team',
      ranking: 1,
      captain: 'Pat Cummins',
      coach: 'Andrew McDonald',
      matches: 845,
      worldCups: 5
    },
    {
      id: 3,
      name: 'England',
      shortname: 'ENG',
      logo: 'https://placehold.co/400x300/blue/white?text=England+Team',
      ranking: 3,
      captain: 'Jos Buttler',
      coach: 'Brendon McCullum',
      matches: 1058,
      worldCups: 1
    },
    {
      id: 4,
      name: 'New Zealand',
      shortname: 'NZ',
      logo: 'https://placehold.co/400x300/black/white?text=New+Zealand+Team',
      ranking: 4,
      captain: 'Kane Williamson',
      coach: 'Gary Stead',
      matches: 462,
      worldCups: 0
    },
    {
      id: 5,
      name: 'Pakistan',
      shortname: 'PAK',
      logo: 'https://placehold.co/400x300/green/white?text=Pakistan+Team',
      ranking: 5,
      captain: 'Babar Azam',
      coach: 'Gary Kirsten',
      matches: 445,
      worldCups: 1
    },
    {
      id: 6,
      name: 'South Africa',
      shortname: 'SA',
      logo: 'https://placehold.co/400x300/green/yellow?text=South+Africa+Team',
      ranking: 6,
      captain: 'Temba Bavuma',
      coach: 'Rob Walter',
      matches: 452,
      worldCups: 0
    }
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, we would fetch team data from the API
        // For now, we'll use mock data since the API doesn't have a direct endpoint for all teams
        
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTeams(mockTeams);
        setError(null);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load team data. Please try again later.');
        setTeams(mockTeams); // Fallback to mock data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Cricket Teams</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore top cricket teams from around the world competing at the highest level.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8 bg-white rounded-lg shadow-md">
              <p>{error}</p>
              <button 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <div key={team.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={team.logo} 
                      alt={`${team.name} Cricket Team`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{team.name}</h3>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        ICC Rank: #{team.ranking}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>
                        <p>Captain: {team.captain}</p>
                        <p>Coach: {team.coach}</p>
                      </div>
                      <div className="text-right">
                        <p>Test Matches: {team.matches}</p>
                        <p>World Cups: {team.worldCups}</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors">
                      View Team Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeamsPage;
