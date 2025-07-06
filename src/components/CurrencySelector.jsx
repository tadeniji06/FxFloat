import { useEffect, useState } from "react";
import axios from "axios";
import { Api_Url } from "../utils/api";

const CurrencySelector = ({ label, value, onChange, direction = "from" }) => {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get(`${Api_Url}/currencies`);
        const filtered = res.data?.data?.filter((c) =>
          direction === "from" ? c.recv : c.send
        );
        setCurrencies(filtered || []);
      } catch (err) {
        console.error("Currency fetch failed:", err.message);
      }
    };

    fetchCurrencies();
  }, [direction]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded bg-white"
      >
        <option value="">Select Currency</option>
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.coin} ({c.network})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
