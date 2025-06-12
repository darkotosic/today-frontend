'use client';

import { useState, useEffect } from 'react';
import moment from 'moment-timezone';

export default function Home() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().tz('Europe/Belgrade').format('YYYY-MM-DD')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setIsLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/fixtures?date=${selectedDate}`;
        const res = await fetch(url);
        const data = await res.json();
        setFixtures(data.response || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        setIsLoading(false);
      }
    };

    fetchFixtures();
  }, [selectedDate]);

  const handleDateChange = (offset: number) => {
    const newDate = moment().tz('Europe/Belgrade').add(offset, 'days').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  return (
    <main className="min-h-screen bg-black text-green-400 p-4">
      <h1 className="text-4xl font-bold text-center mb-6">NAKSIR TIPSTERS PORTAL</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={() => handleDateChange(-1)} className="border px-4 py-2 hover:bg-green-700">
          Yesterday
        </button>
        <button onClick={() => handleDateChange(0)} className="border px-4 py-2 bg-green-700">
          Today
        </button>
        <button onClick={() => handleDateChange(1)} className="border px-4 py-2 hover:bg-green-700">
          Tomorrow
        </button>
      </div>

      {isLoading ? (
        <p className="text-center">Loading fixtures...</p>
      ) : fixtures.length === 0 ? (
        <p className="text-center">No matches found.</p>
      ) : (
        fixtures.map((fixture: any) => (
          <div key={fixture.fixture.id} className="border border-green-400 rounded p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <img src={fixture.league.logo} alt="League Logo" className="w-6 h-6" />
                <span className="font-bold">{fixture.league.name}</span>
                {fixture.league.country && fixture.league.country.length > 0 && (
                  <img
                    src={`https://flagsapi.com/${fixture.league.country_code || 'US'}/flat/24.png`}
                    alt={fixture.league.country}
                    className="w-6 h-4 ml-2"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              <div className="text-right">
                <div>Status: {fixture.fixture.status.long}</div>
                <div>
                  {moment(fixture.fixture.date).tz('Europe/Belgrade').format('DD/MM/YYYY - HH:mm')}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <img src={fixture.teams.home.logo} alt="Home Logo" className="w-6 h-6" />
                <span className="font-bold">{fixture.teams.home.name}</span>
                {fixture.fixture.status.short === 'FT' && (
                  <span className="text-2xl font-bold text-green-400 ml-2">
                    {fixture.goals.home}
                  </span>
                )}
              </div>

              <div className="font-bold text-xl">VS</div>

              <div className="flex items-center space-x-2">
                {fixture.fixture.status.short === 'FT' && (
                  <span className="text-2xl font-bold text-green-400 mr-2">
                    {fixture.goals.away}
                  </span>
                )}
                <span className="font-bold">{fixture.teams.away.name}</span>
                <img src={fixture.teams.away.logo} alt="Away Logo" className="w-6 h-6" />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-2">
              <div className="border px-4 py-1">Home: {fixture.odds[0]?.bookmakers[0]?.bets[0]?.values[0]?.odd || 'N/A'}</div>
              <div className="border px-4 py-1">Draw: {fixture.odds[0]?.bookmakers[0]?.bets[0]?.values[1]?.odd || 'N/A'}</div>
              <div className="border px-4 py-1">Away: {fixture.odds[0]?.bookmakers[0]?.bets[0]?.values[2]?.odd || 'N/A'}</div>
            </div>

            <div className="text-center mt-2">
              Advice:{' '}
              {fixture.predictions[0]?.predictions?.advice
                ? fixture.predictions[0]?.predictions?.advice
                : 'No predictions available'}
              {fixture.fixture.status.short === 'FT' &&
                fixture.predictions[0]?.predictions?.winner?.name &&
                (fixture.predictions[0]?.predictions?.winner?.name === 'Draw' ||
                  fixture.predictions[0]?.predictions?.winner?.name === fixture.teams.home.name ||
                  fixture.predictions[0]?.predictions?.winner?.name === fixture.teams.away.name) && (
                  <span className="ml-2 text-green-500 font-bold">✅</span>
                )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
