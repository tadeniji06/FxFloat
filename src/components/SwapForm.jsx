import { useEffect, useState } from "react";
import axios from "axios";
import { Api_Url } from "../utils/api";
import { setCookie } from "../utils/cookies";
import { motion } from "framer-motion";

const SwapForm = ({ onRateFetched }) => {
	const [form, setForm] = useState({
		fromCcy: "",
		toCcy: "",
		amount: "",
		direction: "from",
		type: "float",
	});
	const [currencies, setCurrencies] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [fetchingCurrencies, setFetchingCurrencies] = useState(true);

	useEffect(() => {
		const fetchCurrencies = async () => {
			try {
				setFetchingCurrencies(true);
				const res = await axios.get(`${Api_Url}/currencies`);
				setCurrencies(res.data.data || []);
			} catch (err) {
				console.error("❌ Failed to fetch currencies", err);
				setErrors({
					general:
						"Failed to load currencies. Please refresh the page.",
				});
			} finally {
				setFetchingCurrencies(false);
			}
		};
		fetchCurrencies();
	}, []);

	const validateForm = () => {
		const newErrors = {};

		if (!form.amount) {
			newErrors.amount = "Amount is required";
		} else if (parseFloat(form.amount) <= 0) {
			newErrors.amount = "Amount must be greater than 0";
		} else if (parseFloat(form.amount) > 1000000) {
			newErrors.amount = "Amount is too large";
		}

		if (!form.fromCcy) {
			newErrors.fromCcy = "Please select source currency";
		}

		if (!form.toCcy) {
			newErrors.toCcy = "Please select destination currency";
		}

		if (form.fromCcy === form.toCcy && form.fromCcy) {
			newErrors.toCcy =
				"Source and destination currencies must be different";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });

		// Clear specific error when user starts typing
		if (errors[name]) {
			setErrors({ ...errors, [name]: "" });
		}
	};

	const swapCurrencies = () => {
		setForm({
			...form,
			fromCcy: form.toCcy,
			toCcy: form.fromCcy,
		});
		setErrors({});
	};

	const getRate = async () => {
		if (!validateForm()) return;

		setLoading(true);
		setErrors({});

		try {
			const res = await axios.post(`${Api_Url}/rate`, form);
			setCookie("swap_form", JSON.stringify(form), 1);
			setCookie("swap_rate", JSON.stringify(res.data), 1);
			onRateFetched(form, res.data);
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				"Failed to fetch exchange rate. Please try again.";
			setErrors({ general: errorMessage });
		} finally {
			setLoading(false);
		}
	};

	const fromCurrencies = currencies.filter((c) => c.recv);
	const toCurrencies = currencies.filter((c) => c.send);

	return (
		<motion.div
			className='bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 max-w-md mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			{/* Header */}
			<div className='text-center'>
				<div className='flex items-center justify-center space-x-2 mb-2'>
					<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
						<span className='text-white text-sm font-bold'>1</span>
					</div>
					<h2 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
						Crypto Exchange
					</h2>
				</div>
				<p className='text-gray-600 text-sm'>
					Fast, secure, and anonymous crypto swaps
				</p>
			</div>

			{/* General Error */}
			{errors.general && (
				<motion.div
					className='bg-red-50 border border-red-200 rounded-xl p-3'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<p className='text-red-700 text-sm flex items-center'>
						<span className='mr-2'>❌</span>
						{errors.general}
					</p>
				</motion.div>
			)}

			{/* Amount Input */}
			<div>
				<label className='block text-sm font-semibold text-gray-700 mb-2'>
					Amount to Exchange
				</label>
				<input
					name='amount'
					type='number'
					placeholder='Enter amount'
					value={form.amount}
					onChange={handleChange}
					className={`w-full p-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
						errors.amount
							? "border-red-400 bg-red-50"
							: "border-gray-200 hover:border-gray-300"
					}`}
					min='0'
					step='any'
				/>
				{errors.amount && (
					<motion.p
						className='text-red-500 text-xs mt-1 flex items-center'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<span className='mr-1'>⚠️</span>
						{errors.amount}
					</motion.p>
				)}
			</div>

			{/* Currency Selectors */}
			<div className='space-y-4'>
				<div className='relative'>
					{/* From Currency */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							From Currency
						</label>
						<select
							name='fromCcy'
							onChange={handleChange}
							value={form.fromCcy}
							disabled={fetchingCurrencies}
							className={`w-full p-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.fromCcy
									? "border-red-400 bg-red-50"
									: "border-gray-200 hover:border-gray-300"
							} ${
								fetchingCurrencies
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}
						>
							<option value=''>
								{fetchingCurrencies
									? "Loading currencies..."
									: "Select source currency"}
							</option>
							{fromCurrencies.map((c) => (
								<option key={c.code} value={c.code}>
									{c.coin} ({c.network})
								</option>
							))}
						</select>
						{errors.fromCcy && (
							<motion.p
								className='text-red-500 text-xs mt-1 flex items-center'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<span className='mr-1'>⚠️</span>
								{errors.fromCcy}
							</motion.p>
						)}
					</div>

					{/* Swap Button */}
					<div className='flex justify-center my-2'>
						<motion.button
							type='button'
							onClick={swapCurrencies}
							disabled={!form.fromCcy && !form.toCcy}
							className='p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							title='Swap currencies'
						>
							<svg
								className='w-5 h-5 text-gray-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
								/>
							</svg>
						</motion.button>
					</div>

					{/* To Currency */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>
							To Currency
						</label>
						<select
							name='toCcy'
							onChange={handleChange}
							value={form.toCcy}
							disabled={fetchingCurrencies}
							className={`w-full p-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.toCcy
									? "border-red-400 bg-red-50"
									: "border-gray-200 hover:border-gray-300"
							} ${
								fetchingCurrencies
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}
						>
							<option value=''>
								{fetchingCurrencies
									? "Loading currencies..."
									: "Select destination currency"}
							</option>
							{toCurrencies.map((c) => (
								<option key={c.code} value={c.code}>
									{c.coin} ({c.network})
								</option>
							))}
						</select>
						{errors.toCcy && (
							<motion.p
								className='text-red-500 text-xs mt-1 flex items-center'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<span className='mr-1'>⚠️</span>
								{errors.toCcy}
							</motion.p>
						)}
					</div>
				</div>
			</div>

			{/* Get Rate Button */}
			<motion.button
				onClick={getRate}
				disabled={loading || fetchingCurrencies}
				className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
					loading || fetchingCurrencies
						? "bg-gray-300 text-gray-500 cursor-not-allowed"
						: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]"
				}`}
				whileTap={{ scale: 0.98 }}
			>
				{loading ? (
					<div className='flex items-center justify-center space-x-2'>
						<div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
						<span>Getting Best Rate...</span>
					</div>
				) : (
					"Get Exchange Rate"
				)}
			</motion.button>

			{/* Features */}
			<div className='grid grid-cols-3 gap-2 pt-4 border-t border-gray-100'>
				<div className='text-center'>
					<div className='text-green-500 text-lg mb-1'>🔒</div>
					<p className='text-xs text-gray-600'>Secure</p>
				</div>
				<div className='text-center'>
					<div className='text-blue-500 text-lg mb-1'>⚡</div>
					<p className='text-xs text-gray-600'>Fast</p>
				</div>
				<div className='text-center'>
					<div className='text-purple-500 text-lg mb-1'>🕶️</div>
					<p className='text-xs text-gray-600'>Anonymous</p>
				</div>
			</div>
		</motion.div>
	);
};

export default SwapForm;
