import { useState } from "react";
import SwapForm from "./SwapForm";
import DepositInfo from "./DepositInfo";
import { motion, AnimatePresence } from "framer-motion";

const MainApp = () => {
	const [rateInfo, setRateInfo] = useState(null);
	const [showDeposit, setShowDeposit] = useState(false);

	const handleConfirm = () => {
		setShowDeposit(true);
	};

	const handleReset = () => {
		setRateInfo(null);
		setShowDeposit(false);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
			{/* Background decoration */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl'></div>
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl'></div>
			</div>

			<div className='relative z-10 w-full max-w-md'>
				{/* Progress Indicator */}
				<div className='flex justify-center mb-6'>
					<div className='flex items-center space-x-2'>
						<div
							className={`w-8 h-1 rounded-full transition-all duration-300 ${
								!rateInfo ? "bg-blue-500" : "bg-green-500"
							}`}
						></div>
						<div
							className={`w-8 h-1 rounded-full transition-all duration-300 ${
								rateInfo && !showDeposit
									? "bg-blue-500"
									: rateInfo && showDeposit
									? "bg-green-500"
									: "bg-gray-300"
							}`}
						></div>
						<div
							className={`w-8 h-1 rounded-full transition-all duration-300 ${
								showDeposit ? "bg-blue-500" : "bg-gray-300"
							}`}
						></div>
					</div>
				</div>

				<AnimatePresence mode='wait'>
					{!rateInfo && !showDeposit && (
						<motion.div
							key='swap-form'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
						>
							<SwapForm
								onRateFetched={(form, rate) =>
									setRateInfo({ form, rate })
								}
							/>
						</motion.div>
					)}

					{rateInfo && !showDeposit && (
						<motion.div
							key='rate-confirmation'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
						>
							<div className='bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 text-center'>
								{/* Header */}
								<div className='flex items-center justify-center space-x-2'>
									<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
										<span className='text-white text-sm font-bold'>
											2
										</span>
									</div>
									<h2 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
										Confirm Exchange
									</h2>
								</div>

								{/* Exchange Summary */}
								<div className='space-y-4'>
									{/* You Send */}
									<div className='bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200 rounded-xl p-4'>
										<p className='text-sm text-orange-600 font-medium mb-1'>
											You Send
										</p>
										<p className='text-2xl font-bold text-orange-800'>
											{rateInfo.form.amount} {rateInfo.form.fromCcy}
										</p>
									</div>

									{/* Exchange Arrow */}
									<div className='flex justify-center'>
										<motion.div
											animate={{ y: [0, -5, 0] }}
											transition={{ duration: 2, repeat: Infinity }}
											className='p-2 bg-blue-100 rounded-full'
										>
											<svg
												className='w-6 h-6 text-blue-600'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M19 14l-7 7m0 0l-7-7m7 7V3'
												/>
											</svg>
										</motion.div>
									</div>

									{/* You Receive */}
									<div className='bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4'>
										<p className='text-sm text-green-600 font-medium mb-1'>
											You Receive
										</p>
										<p className='text-2xl font-bold text-green-800'>
											{rateInfo?.rate?.data?.to?.amount ||
												"Calculating..."}{" "}
											{rateInfo.form.toCcy}
										</p>
									</div>
								</div>

								{/* Exchange Rate */}
								<div className='bg-blue-50 border border-blue-200 rounded-xl p-3'>
									<p className='text-sm text-blue-600 mb-1'>
										Exchange Rate
									</p>
									<p className='text-blue-800 font-medium'>
										1 {rateInfo.form.fromCcy} ={" "}
										{rateInfo?.rate?.data?.from?.rate?.toFixed(6) ||
											"0"}{" "}
										{rateInfo.form.toCcy}
									</p>
								</div>

								{/* Processing Time */}
								<div className='bg-purple-50 border border-purple-200 rounded-xl p-3'>
									<p className='text-sm text-purple-600 mb-1'>
										⏱️ Processing Time
									</p>
									<p className='text-purple-800 font-medium'>
										5-30 minutes
									</p>
								</div>

								{/* Action Buttons */}
								<div className='flex flex-col sm:flex-row gap-3 pt-4'>
									<motion.button
										onClick={() => setRateInfo(null)}
										className='flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium'
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										← Back
									</motion.button>
									<motion.button
										onClick={handleConfirm}
										className='flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium'
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										Confirm & Continue →
									</motion.button>
								</div>

								{/* Disclaimer */}
								<div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left'>
									<p className='text-xs text-yellow-700'>
										<span className='font-semibold'>📋 Note:</span>{" "}
										Exchange rates are valid for 10 minutes. The final
										amount may vary slightly due to market
										fluctuations.
									</p>
								</div>
							</div>
						</motion.div>
					)}

					{rateInfo && showDeposit && (
						<motion.div
							key='deposit-info'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.3 }}
						>
							<DepositInfo
								rate={rateInfo.rate}
								onReset={handleReset}
							/>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Footer */}
				<motion.div
					className='text-center mt-8 space-y-2'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<p className='text-xs text-gray-500'>
						Powered by FxFloat • Secure • Anonymous • Fast
					</p>
					<div className='flex justify-center space-x-4 text-xs text-gray-400'>
						<span>🔒 SSL Encrypted</span>
						<span>•</span>
						<span>🚫 No Registration</span>
						<span>•</span>
						<span>⚡ Instant Swaps</span>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default MainApp;
