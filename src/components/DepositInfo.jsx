import { useEffect, useState } from "react";
import axios from "axios";
import { Api_Url } from "../utils/api";
import { getCookie, deleteCookie, setCookie } from "../utils/cookies";
import { motion, AnimatePresence } from "framer-motion";

const DepositInfo = ({ rate, onReset }) => {
	const [form, setForm] = useState(null);
	const [order, setOrder] = useState(null);
	const [toAddress, setToAddress] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);
	const [savedRate, setSavedRate] = useState(null);

	useEffect(() => {
		const savedForm = getCookie("swap_form");
		const savedRateData = getCookie("swap_rate");

		if (savedForm) {
			try {
				setForm(JSON.parse(savedForm));
			} catch {
				console.warn("⚠️ Failed to parse saved form");
			}
		}

		if (savedRateData) {
			try {
				setSavedRate(JSON.parse(savedRateData));
			} catch {
				console.warn("⚠️ Failed to parse saved rate");
			}
		}

		// Save current rate if provided
		if (rate) {
			setCookie("swap_rate", JSON.stringify(rate), 1);
			setSavedRate(rate);
		}
	}, [rate]);

	const validateAddress = (address) => {
		if (!address) return "Address is required";
		if (address.length < 10) return "Address seems too short";
		if (address.includes(" ")) return "Address cannot contain spaces";
		return "";
	};

	const handleCreateOrder = async () => {
		const addressError = validateAddress(toAddress);
		if (addressError) {
			setError(addressError);
			return;
		}

		if (!form) {
			setError("No swap data found. Please start over.");
			return;
		}

		const payload = {
			...form,
			toAddress,
		};

		try {
			setLoading(true);
			setError("");
			const res = await axios.post(
				`${Api_Url}/create-order`,
				payload
			);
			setOrder(res.data?.data);
			deleteCookie("swap_form");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Order creation failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const depositAddress = order?.from?.address || "Not generated";
	const receiveAmount =
		savedRate?.data?.to?.amount || "Calculating...";
	const exchangeRate = savedRate?.data?.from?.rate || 0;

	return (
		<motion.div
			className='bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 text-center max-w-md mx-auto'
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<div className='flex items-center justify-center space-x-2'>
				<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
					<span className='text-white text-sm font-bold'>3</span>
				</div>
				<h2 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
					Complete Your Swap
				</h2>
			</div>

			<AnimatePresence mode='wait'>
				{!order ? (
					<motion.div
						key='form'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className='space-y-4'
					>
						{/* Rate Summary */}
						{savedRate && form && (
							<div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4'>
								<p className='text-sm text-blue-600 mb-2'>
									You will receive approximately:
								</p>
								<p className='text-xl font-bold text-blue-800'>
									{receiveAmount} {form.toCcy}
								</p>
								<p className='text-xs text-blue-500 mt-1'>
									Rate: 1 {form.fromCcy} ≈ {exchangeRate.toFixed(6)}{" "}
									{form.toCcy}
								</p>
							</div>
						)}

						<div className='text-left'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								Your Receiving Wallet Address
							</label>
							<input
								type='text'
								placeholder={`Enter your ${
									form?.toCcy || "wallet"
								} address`}
								value={toAddress}
								onChange={(e) => {
									setToAddress(e.target.value);
									setError("");
								}}
								className={`w-full p-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
									error
										? "border-red-400 bg-red-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
							/>
							{error && (
								<motion.p
									className='text-red-500 text-sm mt-2 flex items-center'
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<span className='mr-1'>⚠️</span>
									{error}
								</motion.p>
							)}
						</div>

						<motion.button
							onClick={handleCreateOrder}
							disabled={loading || !toAddress}
							className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
								loading || !toAddress
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]"
							}`}
							whileTap={{ scale: 0.98 }}
						>
							{loading ? (
								<div className='flex items-center justify-center space-x-2'>
									<div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
									<span>Creating Order...</span>
								</div>
							) : (
								"Generate Deposit Address"
							)}
						</motion.button>

						{/* Disclaimer */}
						<div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left'>
							<p className='text-xs text-yellow-700'>
								<span className='font-semibold'>⚠️ Important:</span>{" "}
								Double-check your receiving address. Transactions
								cannot be reversed once sent.
							</p>
						</div>
					</motion.div>
				) : (
					<motion.div
						key='deposit'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className='space-y-6'
					>
						{/* Success Animation */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{
								delay: 0.2,
								type: "spring",
								stiffness: 200,
							}}
							className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'
						>
							<span className='text-2xl'>✅</span>
						</motion.div>

						{/* Send Amount */}
						<div className='bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4'>
							<p className='text-sm text-orange-600 mb-2 font-medium'>
								Send Exactly:
							</p>
							<p className='font-bold text-2xl text-orange-800'>
								{order?.from?.amount} {form?.fromCcy}
							</p>
						</div>

						{/* Receive Amount */}
						<div className='bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4'>
							<p className='text-sm text-green-600 mb-2 font-medium'>
								You will receive:
							</p>
							<p className='font-bold text-2xl text-green-800'>
								{receiveAmount} {form?.toCcy}
							</p>
						</div>

						{/* Deposit Address */}
						<div className='bg-gray-50 border border-gray-200 rounded-xl p-4'>
							<p className='text-sm text-gray-600 mb-3 font-medium'>
								Send to this address:
							</p>
							<div className='bg-white border border-gray-200 rounded-lg p-3 relative'>
								<p className='font-mono text-sm break-all text-gray-800 pr-8'>
									{depositAddress}
								</p>
								<button
									onClick={() => copyToClipboard(depositAddress)}
									className='absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors'
									title='Copy address'
								>
									{copied ? (
										<span className='text-green-500 text-xs'>✓</span>
									) : (
										<span className='text-gray-500 text-xs'>📋</span>
									)}
								</button>
							</div>
							{copied && (
								<motion.p
									className='text-green-600 text-xs mt-2'
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									Address copied to clipboard!
								</motion.p>
							)}
						</div>

						{/* Warning */}
						<div className='bg-red-50 border border-red-200 rounded-xl p-4 text-left'>
							<p className='text-xs text-red-700'>
								<span className='font-semibold'>🚨 Critical:</span>{" "}
								Send only {form?.fromCcy} to this address. Sending
								other currencies will result in permanent loss.
							</p>
						</div>

						{/* Timer */}
						<div className='bg-blue-50 border border-blue-200 rounded-xl p-3'>
							<p className='text-xs text-blue-700'>
								<span className='font-semibold'>⏰ Time Limit:</span>{" "}
								Complete this transaction within 30 minutes or the
								order will expire.
							</p>
						</div>

						<motion.button
							onClick={onReset}
							className='w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Start New Swap
						</motion.button>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default DepositInfo;
