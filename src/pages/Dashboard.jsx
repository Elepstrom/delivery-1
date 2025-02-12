import { TruckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, color, delay }) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 card-hover animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-full ${color} bg-opacity-10 animate-pulse-slow`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-3xl font-bold gradient-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ time, description, status }) {
  return (
    <div className="flex space-x-4 py-3 animate-slide-in">
      <div className="flex-shrink-0">
        <div className="h-3 w-3 rounded-full bg-green-500 mt-2"></div>
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-800">{description}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </div>
    </div>
  );
}

function Dashboard() {
  const stats = [
    {
      title: 'Véhicules Actifs',
      value: '8',
      icon: TruckIcon,
      color: 'text-blue-600',
      delay: 0.1
    },
    {
      title: 'En Livraison',
      value: '5',
      icon: ClockIcon,
      color: 'text-yellow-600',
      delay: 0.2
    },
    {
      title: 'Livraisons Terminées',
      value: '124',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      delay: 0.3
    },
  ];

  const activities = [
    {
      time: 'Il y a 5 minutes',
      description: 'Camion 3 est arrivé à destination',
      status: 'completed'
    },
    {
      time: 'Il y a 15 minutes',
      description: 'Nouveau trajet assigné au Camion 1',
      status: 'in-progress'
    },
    {
      time: 'Il y a 30 minutes',
      description: 'Camion 2 a commencé sa tournée',
      status: 'in-progress'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text mb-8 animate-slide-in">
        Tableau de Bord
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-xl font-semibold text-gray-800">
            Activité Récente
          </h2>
        </div>
        <div className="p-6 divide-y divide-gray-100">
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              {...activity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;