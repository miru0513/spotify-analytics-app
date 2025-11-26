export default function Login() {
  const BACKEND = "http://127.0.0.1:8000";

  const handleLogin = () => {
    // send the user to the FastAPI Spotify login route
    window.location.href = `${BACKEND}/spotify/login`;
  };

  return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-black via-slate-900 to-black">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-6">
            Spotify Analytics Dashboard
          </h1>
          <button
              onClick={handleLogin}
              className="bg-green-500 text-black font-bold px-8 py-4 rounded-lg text-xl hover:bg-green-400"
          >
            Login with Spotify
          </button>
        </div>
      </div>
  );
}
