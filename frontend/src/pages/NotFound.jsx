import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-6 text-white">

      <div className="text-center">

        <p className="text-7xl font-black tracking-tight text-purple-500">
          404
        </p>

        <h1 className="mt-6 text-2xl font-bold">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          The page you're looking for doesn't
          exist or may have been moved.
        </p>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="mt-7 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
        >
          Back to Dashboard
        </button>

      </div>

    </div>
  );
};

export default NotFound;