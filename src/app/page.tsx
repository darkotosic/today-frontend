"use client";

import { useEffect, useState } from "react";
import moment from "moment-timezone";

export default function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().tz("Europe/Belgrade").format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/fixtures?date=${selectedDate}`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFixtures(data.response || []);
        setLoading(false);
      });
  }, [selectedDate]);

  const changeDate = (offsetDays: number) => {
    const newDate = moment().tz("Europe/Belgrade").add(offsetDays, "days").format("YYYY-MM-DD");
    setSelectedDate(newDate);
  };

  const formatTime = (timestamp: number) => {
    return moment.unix(timestamp).tz("Europe/Belgrade").format("HH:mm");
  };

  const isAdviceCorrect = (fixture: any) => {
    const matchStatus = fixture.fixture.status.short;
    if (matchStatus !== 'FT') return false;

    const homeGoals = fixture.goals?.home ?? 0;
    const awayGoals = fixture.goals?.away ?? 0;
    const totalGoals = homeGoals + awayGoals;

    const advice = fixture.predictions?.[0]?.predictions?.advice?.toLowerCase() || '';
    if (!advice) return false;

    let winnerCorrect = true;

    if (advice.includes('double chance')) {
      if (advice.includes('home') && homeGoals >= awayGoals) winnerCorrect = true;
      else if (advice.includes('away') && awayGoals >= homeGoals) winnerCorrect = true;
      else if (advice.includes('draw') && homeGoals === awayGoals) winnerCorrect = true;
      else winnerCorrect = false;
    } else if (advice.includes('home win')) {
      winnerCorrect = homeGoals > awayGoals;
    } else if (advice.includes('away win')) {
      winnerCorrect = awayGoals > homeGoals;
    } else if (advice.includes('draw') && !advice.includes('double chance')) {
      winnerCorrect = homeGoals === awayGoals;
    }

    let goalsCorrect = true;
    const goalsMatch = advice.match(/([+-]?\d+(\.\d+)?) goals/);
    if (goalsMatch) {
      const goalsValue = parseFloat(goalsMatch[1]);
      if (advice.includes('under') || advice.includes('-')) {
        goalsCorrect = totalGoals < goalsValue;
      } else if (advice.includes('over') || advice.includes('+')) {
        goalsCorrect = totalGoals > goalsValue;
      }
    }

    return winnerCorrect && goalsCorrect;
  };

  return (
    <main className="min-h-screen bg-black text-green-400 p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">NAKSIR TIPSTERS PORTAL</h1>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => changeDate(-1)}
          className={`border px-4 py-2 ${
            moment().tz("Europe/Belgrade").add(-1, "days").format("YYYY-MM-DD") === selectedDate ? "bg-green-800" : ""
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => changeDate(0)}
          className={`border px-4 py-2 ${
            moment().tz("Europe/Belgrade").format("YYYY-MM-DD") === selectedDate ? "bg-green-800" : ""
          }`}
        >
          Today
        </button>
        <button
          onClick={() => changeDate(1)}
          className={`border px-4 py-2 ${
            moment().tz("Europe/Belgrade").add(1, "days").format("YYYY-MM-DD") === selectedDate ? "bg-green-800" : ""
          }`}
        >
          Tomorrow
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading fixtures...</p>
      ) : fixtures.length === 0 ? (
        <p className="text-center">No matches found.</p>
      ) : (
        fixtures.map((fixture: any) => {
          const odds =
            fixture?.odds?.length > 0 &&
            fixture.odds[0]?.bookmakers?.length > 0
              ? fixture.odds[0].bookmakers[0]?.bets?.find((b: any) => b.name === "Match Winner")?.values || []
              : [];

          const predictionAdvice =
            fixture?.predictions?.length > 0
              ? fixture.predictions[0]?.predictions?.advice
              : "";

          const matchStatus = fixture.fixture.status.short;
          const homeGoals = fixture.goals?.home ?? 0;
          const awayGoals = fixture.goals?.away ?? 0;

          return (
            <div key={fixture.fixture.id} className="border border-green-400 p-4 mb-4 rounded bg-black">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <img src={fixture.league.logo} alt="League Logo" className="w-6 h-6" />
                  <span className="font-bold">{fixture.league.name}</span>
                  {fixture.league.flag && (
                    <img src={fixture.league.flag} alt="Country Flag" className="w-5 h-5 ml-2" />
                  )}
                </div>
                <div className="text-right text-sm">
                  <div>Status: {fixture.fixture.status.long}</div>
                  <div>
                    {moment(fixture.fixture.date).tz("Europe/Belgrade").format("DD/MM/YYYY")} -{" "}
                    {formatTime(fixture.fixture.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <img src={fixture.teams.home.logo} alt="Home Logo" className="w-8 h-8" />
                  <span className="text-lg font-bold">{fixture.teams.home.name}</span>
                  {matchStatus === "FT" && <span className="text-2xl font-bold ml-2">{homeGoals}</span>}
                </div>

                <span className="text-xl font-bold">VS</span>

                <div className="flex items-center space-x-2">
                  {matchStatus === "FT" && <span className="text-2xl font-bold mr-2">{awayGoals}</span>}
                  <span className="text-lg font-bold">{fixture.teams.away.name}</span>
                  <img src={fixture.teams.away.logo} alt="Away Logo" className="w-8 h-8" />
                </div>
              </div>

              <div className="flex space-x-2 mb-2 justify-center">
                {odds.map((o: any) => (
                  <div key={o.value} className="border border-green-400 px-2 py-1 rounded text-center text-sm">
                    {o.value}: {o.odd}
                  </div>
                ))}
              </div>

              <div className="text-center mt-2">
                Advice: {predictionAdvice || "No predictions available"}
                {isAdviceCorrect(fixture) && <span className="ml-2 text-green-500 font-bold">✅</span>}
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
