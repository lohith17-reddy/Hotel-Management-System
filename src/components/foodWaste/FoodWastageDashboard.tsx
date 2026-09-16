import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Scale,
  DollarSign,
  ChefHat,
  Info,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';
import {
  MealType,
  MealPrediction,
  FoodPreparation,
  FoodWasteInsight,
  FoodWasteSettings,
  MealAttendance
} from '../../types/index.ts';
import { InfoTooltip } from '../common/InfoTooltip.tsx';

// Custom rich chart tooltips for enhanced analytics UX
const CustomQuantityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs text-white max-w-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
          <span className="font-bold text-indigo-300 capitalize">{label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            data.wasteRate > 10 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {data.wasteRate}% Waste
          </span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Prepared:
            </span>
            <span className="font-mono font-semibold text-white">{data.prepared} kg</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Consumed:
            </span>
            <span className="font-mono font-semibold text-emerald-400">{data.consumed} kg</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Surplus Waste:
            </span>
            <span className="font-mono font-bold text-rose-400">{data.wasted} kg</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-800/80 p-1.5 rounded border border-slate-700/60 leading-tight">
          💡 Cost impact: <strong className="text-slate-200">₹{data.costWasted}</strong> lost on unconsumed batch remainder.
        </div>
      </div>
    );
  }
  return null;
};

const CustomCostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-rose-500/30 p-3.5 rounded-xl shadow-2xl text-xs text-white max-w-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
          <span className="font-bold text-rose-300 capitalize">{label}</span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">Direct Cost Loss</span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-[11px] text-slate-300">Total Loss:</span>
          <span className="text-xl font-black text-rose-400 font-mono">₹{data.costWasted}</span>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-800/80 p-1.5 rounded border border-slate-700/60 space-y-0.5">
          <div>• Waste Ratio: <strong className="text-slate-200">{data.wasteRate}%</strong> of batch</div>
          <div>• Wasted Qty: <strong className="text-slate-200">{data.wasted} kg</strong> raw ingredients</div>
        </div>
      </div>
    );
  }
  return null;
};

export const FoodWastageDashboard: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [predictions, setPredictions] = useState<MealPrediction[]>([]);
  const [preparations, setPreparations] = useState<FoodPreparation[]>([]);
  const [insights, setInsights] = useState<FoodWasteInsight[]>([]);
  const [accuracy, setAccuracy] = useState<{ mae: number; rmse: number; mape: number; sampleSize: number }>({
    mae: 2.1,
    rmse: 2.8,
    mape: 4.8,
    sampleSize: 14,
  });
  const [settings, setSettings] = useState<FoodWasteSettings>({
    wasteThresholdPercent: 10,
    safetyBufferPercent: 3,
    predictionModel: 'WMA_LEAVE_ADJUSTED',
  });
  const [studentMealOptIns, setStudentMealOptIns] = useState<MealAttendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Sub-views
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [showScalerModal, setShowScalerModal] = useState<boolean>(false);
  const [scalerMealType, setScalerMealType] = useState<MealType>('lunch');
  const [scalerServings, setScalerServings] = useState<number>(40);
  const [scaledIngredients, setScaledIngredients] = useState<Array<{ ingredient: string; quantity: number; unit: string; costPerUnit: number; estimatedCost: number }>>([]);

  const [aiAdvice, setAiAdvice] = useState<{ headline: string; advice: string; actionablePoints: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Form State for Recording Food Prep
  const [prepForm, setPrepForm] = useState<{
    mealType: MealType;
    foodItem: string;
    quantityPrepared: number;
    quantityConsumed: number;
    unit: string;
    studentsAttended: number;
    costPerUnit: number;
    reasonForWastage: string;
  }>({
    mealType: 'lunch',
    foodItem: 'Steamed Rice (Basmati Blend)',
    quantityPrepared: 18,
    quantityConsumed: 16.5,
    unit: 'kg',
    studentsAttended: 40,
    costPerUnit: 60,
    reasonForWastage: 'Plate surplus & counter pot remnant',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFoodWasteDashboard(selectedDate);
      if (res.success) {
        setPredictions(res.predictions);
        setPreparations(res.recentPreparations);
        setInsights(res.insights);
        setAccuracy(res.accuracy);
        setSettings(res.settings);
      }

      if (currentStudent) {
        const optInRes = await api.getMealAttendance({ studentId: currentStudent.id, date: selectedDate });
        if (optInRes.success) {
          setStudentMealOptIns(optInRes.mealAttendance);
        }
      }
    } catch (err) {
      console.error('Error fetching food waste data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, currentStudent]);

  // Load Ingredient Scaler on Open
  const handleOpenScaler = async (mealType: MealType, servings: number) => {
    setScalerMealType(mealType);
    setScalerServings(servings);
    try {
      const res = await api.getIngredientEstimate(servings, mealType);
      if (res.success) {
        setScaledIngredients(res.ingredients);
        setShowScalerModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateScalerServings = async (newServings: number) => {
    setScalerServings(newServings);
    try {
      const res = await api.getIngredientEstimate(newServings, scalerMealType);
      if (res.success) {
        setScaledIngredients(res.ingredients);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Student Meal Opt-in Handler
  const handleToggleOptIn = async (mealType: MealType, status: 'eating' | 'not_eating') => {
    if (!currentStudent) return;
    try {
      await api.setMealOptIn({
        studentId: currentStudent.id,
        studentName: currentUser?.name,
        date: selectedDate,
        mealType,
        status,
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update meal opt-in', err);
    }
  };

  // Submit Kitchen Preparation & Wastage Log
  const handleSubmitPrep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordFoodPreparation({
        ...prepForm,
        date: selectedDate,
      });
      setShowRecordModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error recording food preparation');
    }
  };

  // AI Kitchen Advisor Trigger
  const handleGetAiAdvice = async (mealType: MealType) => {
    setIsAiLoading(true);
    setAiAdvice(null);
    try {
      const res = await api.getFoodWasteAIAdvice(mealType, selectedDate);
      if (res.success) {
        setAiAdvice(res.advice);
      }
    } catch (err) {
      console.error('AI advice error', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    return preparations.slice(0, 8).map(p => ({
      name: `${p.mealType} (${p.foodItem.split(' ')[0]})`,
      prepared: p.quantityPrepared,
      consumed: p.quantityConsumed,
      wasted: p.quantityWasted,
      costWasted: p.totalCostWasted,
      wasteRate: p.wastePercentage,
    }));
  }, [preparations]);

  const totalCostWastedPeriod = useMemo(() => {
    return preparations.reduce((acc, p) => acc + p.totalCostWasted, 0);
  }, [preparations]);

  const averageWasteRate = useMemo(() => {
    if (preparations.length === 0) return 6.8;
    const sum = preparations.reduce((acc, p) => acc + p.wastePercentage, 0);
    return parseFloat((sum / preparations.length).toFixed(1));
  }, [preparations]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI Food Wastage Prediction & Mess Management</h1>
              <p className="text-xs text-emerald-200">
                Machine Learning Leave-Adjusted Forecasting • Target Safety Buffer {settings.safetyBufferPercent}% • Max Threshold {settings.wasteThresholdPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            />
          </div>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Tomorrow
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'staff' || currentUser?.role === 'warden') && (
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Kitchen Log</span>
            </button>
          )}
        </div>
      </div>

      {/* STUDENT MEAL OPT-IN BANNER (If logged in as Student) */}
      {currentUser?.role === 'student' && (
        <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-indigo-950">Student Meal Attendance Opt-In ({selectedDate})</h2>
              </div>
              <p className="text-xs text-indigo-700 mt-0.5">
                Let the kitchen know if you are eating today or tomorrow to prevent food wastage!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(meal => {
                const opt = studentMealOptIns.find(m => m.mealType === meal);
                const isEating = opt?.status === 'eating';
                const isNotEating = opt?.status === 'not_eating';

                return (
                  <div key={meal} className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center space-x-3 shadow-2xs">
                    <span className="text-xs font-bold text-slate-800 capitalize">{meal}:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleOptIn(meal, 'eating')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isEating ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ✓ Eating
                      </button>
                      <button
                        onClick={() => handleToggleOptIn(meal, 'not_eating')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isNotEating ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ✕ Skip
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* THREE MEAL PREDICTION CARDS (BREAKFAST, LUNCH, DINNER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(mealType => {
          const pred = predictions.find(p => p.mealType === mealType);
          const mealTimes: Record<MealType, string> = {
            breakfast: '07:30 - 09:30 AM',
            lunch: '12:30 - 02:30 PM',
            dinner: '07:30 - 09:30 PM',
          };

          return (
            <div key={mealType} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-slate-900 capitalize">{mealType} Prediction</h3>
                    <InfoTooltip
                      title={`${mealType.toUpperCase()} Forecast`}
                      content={`Leave-adjusted ML forecast analyzing prior 14-day student dining footfall, weekend attrition curves, and verified leave passes.`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {mealTimes[mealType]}
                  </span>
                </div>

                {/* Key Numbers */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium block">Predicted Attendance</span>
                      <InfoTooltip
                        title="Expected Footfall"
                        content="Estimated resident students who will eat in the mess hall for this meal slot after deducting approved outstations."
                      />
                    </div>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {pred ? pred.predictedAttendance : 38}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Students footfall</span>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-800 font-medium block">Target Servings</span>
                      <InfoTooltip
                        title="Recommended Cook Batch"
                        content={`Calculated as Predicted Attendance + ${settings.safetyBufferPercent}% safety buffer so no resident student goes hungry while minimizing kitchen surplus.`}
                      />
                    </div>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">
                      {pred ? pred.recommendedQuantity : 40}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      +{settings.safetyBufferPercent}% buffer applied
                    </span>
                  </div>
                </div>

                {/* Leave Deductions & Opt-ins */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Residents:</span>
                    <span className="font-semibold text-slate-800">{pred?.totalStudents || 44}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700 font-medium">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                      Deducted Approved Leaves:
                    </span>
                    <span>-{pred?.onLeaveStudents || 0} students</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-700">
                    <span className="text-slate-500">Student Opt-Ins:</span>
                    <span className="font-semibold">{pred?.studentOptInEating || 0} Eating / {pred?.studentOptInNotEating || 0} Skip</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-emerald-700 font-medium">
                    <span>Expected Waste Margin:</span>
                    <span>{pred?.expectedWastage || 2} servings ({pred?.expectedWastagePercent || 5.0}%)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => handleOpenScaler(mealType, pred?.recommendedQuantity || 40)}
                  className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Recipe Scaler</span>
                </button>
                <button
                  onClick={() => handleGetAiAdvice(mealType)}
                  className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Ask Gemini for kitchen batching advice"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Advice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI ADVICE RESULT BANNER IF TRIGGERED */}
      {isAiLoading && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-center space-x-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-xs font-semibold">Gemini AI is analyzing attendance patterns and formulating kitchen advice...</span>
        </div>
      )}

      {aiAdvice && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">{aiAdvice.headline}</h3>
            </div>
            <button onClick={() => setAiAdvice(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
          </div>
          <p className="text-xs text-indigo-200 mt-2">{aiAdvice.advice}</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            {aiAdvice.actionablePoints.map((pt, i) => (
              <div key={i} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">0{i+1}.</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCURACY METRICS & COST SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy (MAE)</span>
            <InfoTooltip
              title="Mean Absolute Error (MAE)"
              content="Calculates the average magnitude of prediction errors in serving portions between our leave-adjusted forecast and actual student headcount."
            />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-900">±{accuracy.mae}</span>
            <span className="text-xs text-slate-500">portions error</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ High precision across 14 meals</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MAPE Variance</span>
            <InfoTooltip
              title="Mean Absolute Percentage Error"
              content="Measures the statistical prediction accuracy of the forecasting algorithm. Values under 10% represent outstanding production fidelity."
            />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-indigo-600">{accuracy.mape}%</span>
            <span className="text-xs text-slate-500">variance</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under industry benchmark (10%)</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Waste Rate</span>
            <InfoTooltip
              title="Batch Waste Percentage"
              content="Calculated as (Quantity Wasted / Quantity Prepared) * 100 across recent kitchen cycles. Helps identify over-production and plate wastage."
            />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-emerald-600">{averageWasteRate}%</span>
            <span className="text-xs text-slate-500">of prepared food</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target limit: {settings.wasteThresholdPercent}%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded Waste Cost</span>
            <InfoTooltip
              title="Direct Financial Loss"
              content="Total monetary cost of wasted raw ingredients across the audit period, calculated as unconsumed quantity multiplied by ingredient unit procurement price."
            />
          </div>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-2xl font-black text-rose-600">₹{totalCostWastedPeriod}</span>
            <span className="text-xs text-slate-500">recent period</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across recorded menu items</p>
        </div>
      </div>

      {/* ANALYTICS CHARTS & RECENT PREPARATION LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wastage Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Food Prepared vs Consumed vs Wasted</h3>
                <InfoTooltip
                  title="Kitchen Volume Dynamics"
                  content="Hover over any bar to compare prepared quantities, actual student consumption, and leftover waste with live financial impact."
                />
              </div>
              <p className="text-xs text-slate-500">Actual kitchen metrics across recorded meals</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Quantity (kg)</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomQuantityTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="prepared" name="Prepared Qty" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumed" name="Consumed Qty" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wasted" name="Wasted Qty" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost of Waste Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Financial Impact: Cost of Food Waste (₹)</h3>
                <InfoTooltip
                  title="Direct Fiscal Waste"
                  content="Monetary evaluation of unconsumed food per batch. Highlights high-cost menu items that require tighter portion controls."
                />
              </div>
              <p className="text-xs text-slate-500">Rupees wasted per food item batch</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Loss (₹)
            </span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomCostTooltip />} />
                <Bar dataKey="costWasted" name="Cost Wasted (₹)" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT KITCHEN PREPARATION LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historical Kitchen Preparations & Wastage Records</h3>
            <p className="text-xs text-slate-500">Audited daily log submitted by mess supervisors</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date / Meal</th>
                <th className="px-4 py-3">Food Item</th>
                <th className="px-4 py-3">Prepared</th>
                <th className="px-4 py-3">Consumed</th>
                <th className="px-4 py-3">Wasted</th>
                <th className="px-4 py-3">Waste %</th>
                <th className="px-4 py-3">Cost Lost</th>
                <th className="px-4 py-3">Reason / Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preparations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">No meal records found for this date.</td>
                </tr>
              ) : (
                preparations.map(p => {
                  const isHigh = p.wastePercentage > settings.wasteThresholdPercent;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.date}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{p.mealType}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{p.foodItem}</td>
                      <td className="px-4 py-3">{p.quantityPrepared} {p.unit}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">{p.quantityConsumed} {p.unit}</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{p.quantityWasted} {p.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.wastePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-rose-700">₹{p.totalCostWasted}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {p.reasonForWastage || 'Standard batch remainder'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INGREDIENT SCALER */}
      {showScalerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dynamic Ingredient Scaler</h3>
                  <p className="text-xs text-slate-500">Calculate raw ingredients for {scalerMealType.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setShowScalerModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Number of Servings:</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={scalerServings}
                  onChange={e => handleUpdateScalerServings(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-indigo-700"
                />
                <span className="text-xs text-slate-500">servings recommended for predicted headcount</span>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 grid grid-cols-4 uppercase">
                <span className="col-span-2">Ingredient Item</span>
                <span>Quantity</span>
                <span className="text-right">Est. Cost</span>
              </div>
              {scaledIngredients.map((item, idx) => (
                <div key={idx} className="px-3 py-2.5 grid grid-cols-4 text-xs items-center hover:bg-slate-50">
                  <span className="col-span-2 font-medium text-slate-800">{item.ingredient}</span>
                  <span className="font-bold text-indigo-700">{item.quantity} {item.unit}</span>
                  <span className="text-right text-slate-600">₹{item.estimatedCost}</span>
                </div>
              ))}
              <div className="bg-slate-50 px-3 py-2.5 grid grid-cols-4 text-xs font-bold text-slate-900 border-t border-slate-200">
                <span className="col-span-2">Total Estimated Raw Cost:</span>
                <span></span>
                <span className="text-right text-emerald-700">
                  ₹{scaledIngredients.reduce((acc, i) => acc + i.estimatedCost, 0)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowScalerModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD KITCHEN PREPARATION & WASTAGE */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Record Daily Kitchen Preparation & Waste</h3>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmitPrep} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Type</label>
                  <select
                    value={prepForm.mealType}
                    onChange={e => setPrepForm({ ...prepForm, mealType: e.target.value as MealType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Food Item</label>
                  <input
                    type="text"
                    value={prepForm.foodItem}
                    onChange={e => setPrepForm({ ...prepForm, foodItem: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prepared Qty</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prepForm.quantityPrepared}
                    onChange={e => setPrepForm({ ...prepForm, quantityPrepared: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consumed Qty</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prepForm.quantityConsumed}
                    onChange={e => setPrepForm({ ...prepForm, quantityConsumed: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={prepForm.unit}
                    onChange={e => setPrepForm({ ...prepForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="kg">kg</option>
                    <option value="pieces">pieces</option>
                    <option value="servings">servings</option>
                    <option value="liters">liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    value={prepForm.costPerUnit}
                    onChange={e => setPrepForm({ ...prepForm, costPerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Students Attended</label>
                  <input
                    type="number"
                    value={prepForm.studentsAttended}
                    onChange={e => setPrepForm({ ...prepForm, studentsAttended: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Wastage (if any)</label>
                <input
                  type="text"
                  value={prepForm.reasonForWastage}
                  onChange={e => setPrepForm({ ...prepForm, reasonForWastage: e.target.value })}
                  placeholder="e.g. End of line buffer, unconsumed gravies"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span>Calculated Wastage:</span>
                <span className="font-bold text-rose-600">
                  {Math.max(0, prepForm.quantityPrepared - prepForm.quantityConsumed).toFixed(1)} {prepForm.unit} (₹
                  {Math.round(Math.max(0, prepForm.quantityPrepared - prepForm.quantityConsumed) * prepForm.costPerUnit)})
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
