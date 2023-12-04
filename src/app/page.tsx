import Image from 'next/image'
import mockData from '../../mockdata.json'; // Importing the mock data

interface Payment {
  name: string;
  amount: number;
}

interface DailyPayment {
  date: string;
  payments: Payment[];
}

interface Movie {
  projectName: string;
  photoExtension: string;
  dailyResidualPayments: DailyPayment[];
}

export default function Home() {
  // Function to calculate total residuals
  const calculateTotalResiduals = (dailyResidualPayments: DailyPayment[]) => {
    return dailyResidualPayments.reduce((total, day) => {
      return total + day.payments.reduce((dayTotal: number, payment) => dayTotal + payment.amount, 0);
    }, 0);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-gray-800 bg-white">
      {/* ... other components ... */}

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {mockData.map((movie: Movie) => (
          <div key={movie.projectName} className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 cursor-pointer">
            <h2 className="mb-3 text-2xl font-semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {movie.projectName}
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Total Residuals: ${calculateTotalResiduals(movie.dailyResidualPayments).toLocaleString()}
            </p>
            <Image
              src={`/images/${movie.photoExtension}.png`} // Updated to .png
              alt={movie.projectName}
              width={100}
              height={100}
            />
            {/* ... other movie details ... */}
          </div>
        ))}
      </div>
    </main>
  )
}
