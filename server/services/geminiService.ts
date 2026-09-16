import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database.ts';

let aiClient: GoogleGenAI | null = null;
let apiCooldownUntil = 0;

// In-memory cache for AI responses with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function isThrottled(): boolean {
  return Date.now() < apiCooldownUntil;
}

function handleGeminiError(context: string, err: any): void {
  const errMsg = err?.message || String(err);
  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
    // Set 60-second cooldown so subsequent calls don't spam the API and fail
    apiCooldownUntil = Date.now() + 60 * 1000;
    // Log concise message rather than dumping full stack trace
    console.info(`[Gemini AI] Quota limit reached for ${context}. Seamlessly switched to smart local analysis engine.`);
  } else {
    console.info(`[Gemini AI] Service notice for ${context}: ${errMsg.substring(0, 100)}... Using smart fallback.`);
  }
}

function getAIClient(): GoogleGenAI | null {
  if (isThrottled()) {
    return null;
  }
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export class GeminiService {
  /**
   * AI Complaint Categorization & Priority Analysis
   */
  public static async classifyComplaint(title: string, description: string): Promise<{
    category: 'electrical' | 'plumbing' | 'internet' | 'cleaning' | 'furniture' | 'food' | 'security' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    suggestedAction: string;
    summary: string;
  }> {
    const cacheKey = `complaint_${title}_${description}`.toLowerCase().trim();
    const cached = getFromCache<any>(cacheKey);
    if (cached) return cached;

    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `Analyze this college hostel maintenance/complaint request and categorize it:
Title: "${title}"
Description: "${description}"

Respond with a JSON object strictly matching this schema:
{
  "category": "electrical" | "plumbing" | "internet" | "cleaning" | "furniture" | "food" | "security" | "other",
  "priority": "low" | "medium" | "high" | "urgent",
  "suggestedAction": "brief 1-sentence action for staff",
  "summary": "1-sentence concise summary"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          setCache(cacheKey, parsed, 60 * 60 * 1000); // 1 hour cache
          return parsed;
        }
      } catch (err) {
        handleGeminiError('complaint classification', err);
      }
    }

    // Rule-based fallback
    const text = `${title} ${description}`.toLowerCase();
    let category: 'electrical' | 'plumbing' | 'internet' | 'cleaning' | 'furniture' | 'food' | 'security' | 'other' = 'other';
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    if (text.includes('fan') || text.includes('light') || text.includes('switch') || text.includes('plug') || text.includes('spark') || text.includes('electric') || text.includes('fuse') || text.includes('power') || text.includes('bulb')) {
      category = 'electrical';
      if (text.includes('spark') || text.includes('shock') || text.includes('smoke') || text.includes('fire') || text.includes('burning')) priority = 'urgent';
    } else if (text.includes('water') || text.includes('tap') || text.includes('leak') || text.includes('pipe') || text.includes('drain') || text.includes('flush') || text.includes('toilet') || text.includes('shower') || text.includes('geyser') || text.includes('sink')) {
      category = 'plumbing';
      if (text.includes('flood') || text.includes('overflow') || text.includes('burst')) priority = 'urgent';
      else if (text.includes('leak') || text.includes('no water')) priority = 'high';
    } else if (text.includes('wifi') || text.includes('internet') || text.includes('lan') || text.includes('router') || text.includes('connection') || text.includes('network') || text.includes('speed')) {
      category = 'internet';
      priority = 'medium';
    } else if (text.includes('clean') || text.includes('dust') || text.includes('garbage') || text.includes('sweep') || text.includes('washroom dirty') || text.includes('trash') || text.includes('smell')) {
      category = 'cleaning';
      priority = 'medium';
    } else if (text.includes('food') || text.includes('mess') || text.includes('roti') || text.includes('rice') || text.includes('dinner') || text.includes('lunch') || text.includes('breakfast') || text.includes('curry') || text.includes('taste') || text.includes('stale') || text.includes('hygiene')) {
      category = 'food';
      if (text.includes('stale') || text.includes('insects') || text.includes('sick')) priority = 'urgent';
    } else if (text.includes('bed') || text.includes('table') || text.includes('chair') || text.includes('cupboard') || text.includes('door') || text.includes('window') || text.includes('lock') || text.includes('almirah') || text.includes('mattress')) {
      category = 'furniture';
      if (text.includes('broken door') || text.includes('lock broken')) priority = 'high';
    } else if (text.includes('theft') || text.includes('steal') || text.includes('stranger') || text.includes('ragging') || text.includes('fight') || text.includes('harass') || text.includes('threat')) {
      category = 'security';
      priority = 'urgent';
    }

    const result = {
      category,
      priority,
      suggestedAction: `Assign to on-duty ${category} technician for inspection and immediate resolution.`,
      summary: title.length > 5 ? title : `${category.charAt(0).toUpperCase() + category.slice(1)} maintenance issue reported.`,
    };

    setCache(cacheKey, result, 30 * 60 * 1000);
    return result;
  }

  /**
   * AI Hostel Analytics & Occupancy Insights
   */
  public static async generateHostelInsights(): Promise<string[]> {
    const cacheKey = 'hostel_insights_latest';
    const cached = getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    const rawData = db.raw();
    const hostels = rawData.hostels || [];
    const allocations = (rawData.allocations || []).filter(a => a.status === 'active');
    const complaints = (rawData.complaints || []).filter(c => c.status !== 'resolved');
    const leaves = (rawData.leaveRequests || []).filter(l => l.status === 'approved');

    const totalCapacity = hostels.reduce((acc, h) => acc + (h.capacity || 0), 0);
    const totalOccupancy = allocations.length;
    const occupancyRate = totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(1) : '0';

    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `You are the AI Chief Warden Analyst for CampusHostel. Based on these real statistics:
- Total Hostels: ${hostels.length} (${hostels.map(h => `${h.name}: ${h.occupancy}/${h.capacity} beds occupied`).join(', ')})
- Overall Occupancy Rate: ${occupancyRate}%
- Active Complaints: ${complaints.length} (pending resolution)
- Students on Approved Leave: ${leaves.length}

Generate exactly 3 actionable, highly professional operational insight bullets. Return as a JSON array of 3 strings.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCache(cacheKey, parsed, 10 * 60 * 1000); // 10 min cache
            return parsed;
          }
        }
      } catch (err) {
        handleGeminiError('hostel insights', err);
      }
    }

    // Dynamic smart analytics fallback from real database figures
    const urgentComplaints = complaints.filter(c => c.priority === 'urgent' || c.priority === 'high').length;
    const insights = [
      `Campus hostel occupancy is operating at ${occupancyRate}% (${totalOccupancy} of ${totalCapacity} registered beds allocated).`,
      urgentComplaints > 0
        ? `${complaints.length} maintenance tickets remain active (${urgentComplaints} flagged high/urgent priority); prompt dispatch recommended.`
        : `${complaints.length} open maintenance requests are currently queued with normal response SLA.`,
      leaves.length > 0
        ? `${leaves.length} resident students have active approved leave passes, automatically synchronizing mess attendance deductions.`
        : `Mess kitchen is operating at standard capacity with zero active student leaves recorded for today.`
    ];

    setCache(cacheKey, insights, 5 * 60 * 1000);
    return insights;
  }

  /**
   * AI Food Wastage Advisor & Kitchen Insights
   */
  public static async generateFoodWasteAdvice(mealType: string, dateStr: string): Promise<{
    headline: string;
    advice: string;
    actionablePoints: string[];
  }> {
    const cacheKey = `food_advice_${mealType}_${dateStr}`;
    const cached = getFromCache<any>(cacheKey);
    if (cached) return cached;

    const predictions = db.get('mealPredictions').find(p => p.date === dateStr && p.mealType === mealType);
    const settings = db.get('foodWasteSettings') || { safetyBufferPercent: 5 };

    const ai = getAIClient();
    if (ai && predictions) {
      try {
        const prompt = `You are an AI Food Wastage Optimization Consultant for a college hostel mess.
Data for ${dateStr} (${mealType}):
- Total Resident Students: ${predictions.totalStudents}
- Students on Leave: ${predictions.onLeaveStudents}
- Students Opted In (Eating): ${predictions.studentOptInEating}
- Predicted Attendance: ${predictions.predictedAttendance}
- Recommended Servings (with ${settings.safetyBufferPercent}% buffer): ${predictions.recommendedQuantity}
- Expected Surplus/Wastage: ${predictions.expectedWastage} servings

Generate a concise, pragmatic kitchen recommendation in JSON format:
{
  "headline": "Short punchy recommendation title",
  "advice": "1-2 sentences of specific kitchen advice",
  "actionablePoints": ["action 1", "action 2", "action 3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          setCache(cacheKey, parsed, 15 * 60 * 1000);
          return parsed;
        }
      } catch (err) {
        handleGeminiError('food waste advice', err);
      }
    }

    const recommended = predictions?.recommendedQuantity || 45;
    const leaveCount = predictions?.onLeaveStudents || 0;
    const buffer = settings.safetyBufferPercent || 5;

    const fallbackAdvice = {
      headline: `Target Preparation: ${recommended} Servings for ${mealType.toUpperCase()}`,
      advice: `Factoring in ${leaveCount} students on outstation leave and opt-in trends, prepare ${recommended} servings with a ${buffer}% safety buffer to minimize food waste.`,
      actionablePoints: [
        `Cook in two staggered batches: 70% during the initial rush window, 30% dynamically on demand.`,
        `Monitor live dining hall footfall at the 30-minute mark before refilling hot counters.`,
        `Preserve untouched excess servings in temperature-controlled holding for evening distribution.`
      ]
    };

    setCache(cacheKey, fallbackAdvice, 10 * 60 * 1000);
    return fallbackAdvice;
  }

  /**
   * AI FAQ Assistant for Campus Students & Residents
   */
  public static async answerStudentQuestion(question: string, studentName?: string): Promise<string> {
    const normalizedQ = question.toLowerCase().trim();
    const cacheKey = `faq_${normalizedQ}`;
    const cached = getFromCache<string>(cacheKey);
    if (cached) return cached;

    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `You are the CampusHostel AI Assistant for college students.
Resident Name: ${studentName || 'Student'}
Rules & Features of this Hostel System:
- Room Allocation: Managed by admin/warden upon admission.
- Room Transfers: Students can submit a Transfer Request via 'My Room' > 'Request Transfer'. Warden reviews and approves based on vacancy.
- Leave Applications: Submit via 'Leave Requests' specifying start/end date, destination, and emergency contact. Approved leave automatically updates mess attendance!
- Food Wastage & Meal Opt-in: Students can confirm meal attendance under 'Meal Opt-In' to help the mess kitchen prevent food surplus and waste.
- Complaints: Submit in 'Complaints' tab with category (Electrical, Plumbing, Food, Internet, etc.). Staff resolves and provides notes.
- Fees & Payments: View fee invoices and make instant mock card/UPI payments with printable receipts in 'Fees & Payments'.
- Visitor Passes: Register expected visitors for warden entry approval.
- Night Curfew: Hostel main gate closes at 10:00 PM; late entry requires warden approval.

User Question: "${question}"

Provide a friendly, helpful, direct answer in 2-3 short sentences.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        if (response.text) {
          const result = response.text.trim();
          setCache(cacheKey, result, 30 * 60 * 1000);
          return result;
        }
      } catch (err) {
        handleGeminiError('student assistant', err);
      }
    }

    // Smart Domain Keyword Knowledge Engine
    let responseText = '';
    if (normalizedQ.includes('transfer') || normalizedQ.includes('change room') || normalizedQ.includes('swap')) {
      responseText = `To request a room transfer, go to 'My Room' and click 'Request Room Transfer'. Choose your desired vacant room/bed and enter your reason; your hostel warden will review and process the transfer.`;
    } else if (normalizedQ.includes('leave') || normalizedQ.includes('outstation') || normalizedQ.includes('home') || normalizedQ.includes('holiday')) {
      responseText = `You can submit a leave request under 'Leave Management' with your travel dates and destination. Once approved by the warden, your mess meal deductions will automatically take effect.`;
    } else if (normalizedQ.includes('fee') || normalizedQ.includes('pay') || normalizedQ.includes('receipt') || normalizedQ.includes('rent') || normalizedQ.includes('invoice')) {
      responseText = `Navigate to 'My Fees & Payments' to view your current semester invoices (hostel rent, mess fee) and make instant secure payments with downloadable official receipts.`;
    } else if (normalizedQ.includes('food') || normalizedQ.includes('meal') || normalizedQ.includes('mess') || normalizedQ.includes('waste') || normalizedQ.includes('eat') || normalizedQ.includes('breakfast') || normalizedQ.includes('dinner')) {
      responseText = `Use the 'Meal Opt-In' widget on your dashboard to indicate if you will be eating breakfast, lunch, or dinner. This ensures the kitchen cooks exact quantities and prevents excess food wastage.`;
    } else if (normalizedQ.includes('complaint') || normalizedQ.includes('repair') || normalizedQ.includes('broken') || normalizedQ.includes('leak') || normalizedQ.includes('fan') || normalizedQ.includes('wifi') || normalizedQ.includes('water')) {
      responseText = `Submit maintenance requests via the 'Complaints' tab. Our system automatically classifies priority and dispatches technician staff to inspect your room.`;
    } else if (normalizedQ.includes('visitor') || normalizedQ.includes('parent') || normalizedQ.includes('guest') || normalizedQ.includes('friend')) {
      responseText = `Visitors must be logged in the 'Visitors' section before entering the hostel premises. Visiting hours are 9:00 AM to 7:00 PM in the designated reception lobby.`;
    } else if (normalizedQ.includes('curfew') || normalizedQ.includes('timing') || normalizedQ.includes('gate') || normalizedQ.includes('late')) {
      responseText = `The hostel gates close at 10:00 PM daily. If you anticipate arriving late due to academic or emergency reasons, please submit an out-pass or notify your floor warden in advance.`;
    } else {
      responseText = `Welcome to CampusHostel! You can manage room allocations, apply for outstation leaves, track mess meal opt-ins, submit maintenance tickets, and pay fees directly through your portal.`;
    }

    setCache(cacheKey, responseText, 30 * 60 * 1000);
    return responseText;
  }
}

