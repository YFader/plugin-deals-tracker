import React, { useState, useEffect } from "react";

export default function App() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [darkMode, setDarkMode] = useState(true);

  // Месяц и год
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  // Роутинг через хэш
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("plugin-")) {
        setCurrentPage(hash);
      } else {
        setCurrentPage(hash || "home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Загрузка данных
  useEffect(() => {
    fetch("https://plugin-tracker.up.railway.app/api/plugins ")
      .then((res) => res.json())
      .then((data) => {
        setPlugins(data);
        setLoading(false);
      });
  }, []);

  // Группировка скидок по датам
  const pluginsByDate = plugins.reduce((acc, plugin) => {
    const dateStr = new Date(plugin.lastUpdated || new Date()).toISOString().split("T")[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(plugin);
    return acc;
  }, {});

  // Получаем количество скидок по дням
  const getDealsByDay = (year, month) => {
    const result = {};
    const currentDate = new Date(year, month);
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      result[day] = pluginsByDate[dateStr]?.length || 0;
    }

    return result;
  };

  const dealsByDay = getDealsByDay(year, month);

  // Количество скидок по дням недели
  const maxDeals = Math.max(...Object.values(dealsByDay)) || 1;

  // Сетка дней календаря
  const calendarDays = (() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    return Array.from({ length: 42 }).map((_, index) => {
      const day = index - firstDayOfMonth + 1;
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];

      const hasDeals = pluginsByDate[dateStr]?.length > 0;
      const dealsCount = pluginsByDate[dateStr]?.length || 0;

      let intensity = "bg-gray-700";
      if (dealsCount >= 5) intensity = "bg-red-600";
      else if (dealsCount >= 3) intensity = "bg-orange-500";
      else if (dealsCount >= 1) intensity = "bg-yellow-500";

      return {
        day,
        dateStr,
        valid: day > 0 && date <= new Date(),
        deals: pluginsByDate[dateStr],
        intensity
      };
    });
  })();

  // Месяцы
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? "bg-black" : "bg-white shadow"} py-4 shadow-lg sticky top-0 z-10 transition-colors duration-300`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1
            onClick={() => {
              window.location.hash = "";
            }}
            className="text-3xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            PluginDeals Tracker
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => (window.location.hash = "calendar")}
              className={`px-4 py-2 rounded-md ${
                currentPage === "calendar"
                  ? "bg-purple-600 text-white"
                  : darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </header>

      {/* Контент страницы */}
      <main className="container mx-auto px-4 pb-16">
        {currentPage === "home" && (
          <>
            <section className="py-12 md:py-16 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Track the Best Audio Plugin Deals
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Stay updated with the latest discounts on premium audio plugins from top brands.
              </p>
            </section>
            <PluginGrid plugins={plugins} loading={loading} darkMode={darkMode} />
          </>
        )}

        {currentPage === "calendar" && (
          <CalendarView
            calendarDays={calendarDays}
            dealsByDay={dealsByDay}
            maxDeals={maxDeals}
            month={month}
            year={year}
            setMonth={setMonth}
            setYear={setYear}
            months={months}
            darkMode={darkMode}
          />
        )}

        {currentPage.startsWith("plugin-") && (
          <PluginDetailPage plugins={plugins} currentPage={currentPage} darkMode={darkMode} />
        )}
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? "bg-gray-900" : "bg-gray-800"} py-6 border-t ${darkMode ? "border-gray-800" : "border-gray-700"} transition-colors duration-300`}>
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} PluginDeals Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Сетка плагинов
function PluginGrid({ plugins, loading, darkMode }) {
  if (loading) return <LoadingSkeleton darkMode={darkMode} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {plugins.slice(0, 6).map((plugin) => (
        <div
          key={plugin.id}
          onClick={() => (window.location.hash = `plugin-${plugin.id}`)}
          className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <img src={plugin.image} alt={plugin.name} className="w-full h-48 object-cover" />
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">{plugin.name}</h3>
              <span className="px-2 py-1 bg-green-600 text-xs font-semibold rounded-full">
                -{plugin.discount}
              </span>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              by {plugin.brand}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Календарь скидок
function CalendarView({
  calendarDays,
  dealsByDay,
  maxDeals,
  month,
  year,
  setMonth,
  setYear,
  months,
  darkMode
}) {
  const daysInMonth = Object.keys(dealsByDay).length;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Календарь скидок</h2>

      {/* Переключатель месяцев */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => {
            if (month === 0) {
              setMonth(11);
              setYear(year - 1);
            } else {
              setMonth(month - 1);
            }
          }}
          className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold">
          {months[month]} {year}
        </h3>
        <button
          onClick={() => {
            if (month === 11) {
              setMonth(0);
              setYear(year + 1);
            } else {
              setMonth(month + 1);
            }
          }}
          className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* График активности */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-2">Активность скидок</h3>
        <div className="flex space-x-1 h-20">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const heightPercent = (dealsByDay[i + 1] / maxDeals) * 100;
            let barColor = "bg-gray-700";
            if (heightPercent >= 70) barColor = "bg-red-600";
            else if (heightPercent >= 40) barColor = "bg-orange-500";
            else if (heightPercent > 0) barColor = "bg-yellow-500";

            return (
              <div key={i} className="flex-1 flex flex-col justify-end h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                ></div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {Array.from({ length: daysInMonth }).map((_, i) =>
            (i + 1) % 5 === 0 ? <span key={i}>{i + 1}</span> : null
          )}
        </div>
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, i) => (
          <div key={i} className={`font-medium p-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={`aspect-square flex flex-col justify-center items-center rounded-md p-1 relative group cursor-default ${
              day.valid ? day.intensity : "bg-gray-800 opacity-30"
            }`}
          >
            <span className="text-sm">{day.day}</span>
            {day.deals && day.deals.length > 0 && (
              <span className="text-xs mt-1">{day.deals.length} скидок</span>
            )}

            {/* Tooltip */}
            {day.deals && day.deals.length > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                {day.deals.map(p => p.name).join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Детальная страница плагина
function PluginDetailPage({ plugins, currentPage, darkMode }) {
  const id = parseInt(currentPage.replace("plugin-", ""));
  const plugin = plugins.find((p) => p.id === id);

  if (!plugin) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold mb-2">Plugin Not Found</h3>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          The requested plugin does not exist or was removed.
        </p>
        <button
          onClick={() => (window.location.hash = "")}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors duration-300"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-xl max-w-4xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <img src={plugin.image} alt={plugin.name} className="w-full h-64 object-cover" />
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-2">{plugin.name}</h2>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>by {plugin.brand}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="line-through text-gray-500 mr-2">{plugin.originalPrice}</span>
            <span className="text-2xl font-bold text-purple-400">{plugin.salePrice}</span>
          </div>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors duration-300">
            Get This Deal
          </button>
        </div>
      </div>
    </div>
  );
}

// Загрузочный скелетон
function LoadingSkeleton({ darkMode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`rounded-xl overflow-hidden shadow-lg animate-pulse ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="w-full h-48 bg-gray-700"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="space-x-2 flex">
                <div className="h-5 bg-gray-700 rounded w-12"></div>
                <div className="h-5 bg-gray-700 rounded w-12"></div>
              </div>
              <div className="h-8 bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}