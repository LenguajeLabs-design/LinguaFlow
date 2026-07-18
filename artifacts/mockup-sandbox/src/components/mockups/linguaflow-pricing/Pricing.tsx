import React, { useState } from 'react';
import { 
  Check, X, Users, BookOpen, Volume2, 
  HelpCircle, Languages, GraduationCap, Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [teachersCount, setTeachersCount] = useState(10);

  const calculateSchoolPrice = (count: number) => {
    return count * 85;
  };

  return (
    <div className="min-h-screen bg-[hsl(210,40%,98%)] text-[hsl(222,47%,11%)] font-sans selection:bg-[hsl(174,62%,42%,0.2)]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm shadow-sm">
        <span className="text-[hsl(215,16%,47%)] font-medium">Try before signing up — create one reading first, then choose a plan.</span>
        <Button variant="outline" size="sm" className="rounded-full border-[hsl(174,62%,42%)] text-[hsl(174,62%,42%)] hover:bg-[hsl(174,62%,42%,0.05)] h-8 px-4 font-medium">
          Try it free
        </Button>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-6 tracking-tight">
            Simple pricing for language learners
          </h1>
          <p className="text-lg text-[hsl(215,16%,47%)] max-w-xl mx-auto">
            Generate personalized passages, practice vocabulary, and master comprehension in 5 languages.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start mb-20 max-w-5xl mx-auto">
          
          {/* Free Tier */}
          <Card className="bg-white border-gray-200 shadow-sm rounded-2xl overflow-hidden mt-8">
            <div className="p-8">
              <h3 className="text-2xl font-['Playfair_Display'] font-semibold mb-2">Free</h3>
              <p className="text-[hsl(215,16%,47%)] text-sm mb-6 h-10">Start learning with no commitment.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-[hsl(215,16%,47%)]"> / forever</span>
              </div>
              <Button className="w-full bg-white text-[hsl(222,47%,11%)] border border-gray-300 hover:bg-gray-50 rounded-xl py-6 mb-8 font-medium">
                Get started free
              </Button>
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-[hsl(215,16%,47%)] mb-2">Included</div>
                <FeatureItem text="10 readings per month" />
                <FeatureItem text="1 language" />
                <FeatureItem text="Vocabulary highlighting" />
                <FeatureItem text="Comprehension questions" />
              </div>
            </div>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-white border-[hsl(174,62%,42%)] shadow-xl shadow-[hsl(174,62%,42%,0.1)] rounded-2xl overflow-hidden relative transform md:-translate-y-4 ring-1 ring-[hsl(174,62%,42%,0.5)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[hsl(174,62%,42%)] via-[hsl(200,68%,52%)] to-[hsl(255,52%,60%)]"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-['Playfair_Display'] font-semibold">Pro</h3>
                <Badge className="bg-[hsl(174,62%,42%,0.1)] text-[hsl(174,62%,42%)] hover:bg-[hsl(174,62%,42%,0.15)] border-0 font-bold px-3 py-1 uppercase tracking-wider text-xs">
                  Most Popular
                </Badge>
              </div>
              <p className="text-[hsl(215,16%,47%)] text-sm mb-6 h-10">The full LinguaFlow experience.</p>
              
              <div className="flex items-center gap-3 mb-6 bg-gray-50 p-1.5 rounded-lg border border-gray-100 inline-flex">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isAnnual ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isAnnual ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Annual
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Save 22%</span>
                </button>
              </div>

              <div className="mb-6 h-16">
                {isAnnual ? (
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">$89</span>
                      <span className="text-[hsl(215,16%,47%)] mb-1">/ year</span>
                    </div>
                    <div className="text-sm text-[hsl(215,16%,47%)] mt-1">
                      <span className="line-through mr-1">$114</span>
                      <span className="text-green-600 font-medium">($7.41 / mo)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">$9.50</span>
                      <span className="text-[hsl(215,16%,47%)] mb-1">/ month</span>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                className="w-full text-white border-0 py-6 mb-8 font-semibold rounded-xl text-md shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
              >
                Start Pro
              </Button>
              
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-[hsl(215,16%,47%)] mb-2">Everything in Free, plus</div>
                <FeatureItem text="Unlimited readings" highlight />
                <FeatureItem text="All 5 languages" />
                <FeatureItem text="Audio (TTS) playback" />
                <FeatureItem text="Vocabulary, questions, translation" />
                <FeatureItem text="CEFR level tracking" />
                <FeatureItem text="Priority support" />
              </div>
            </div>
          </Card>

          {/* School Tier */}
          <Card className="bg-white border-gray-200 shadow-sm rounded-2xl overflow-hidden mt-8">
            <div className="p-8">
              <h3 className="text-2xl font-['Playfair_Display'] font-semibold mb-2">School</h3>
              <p className="text-[hsl(215,16%,47%)] text-sm mb-6 h-10">Annual plan with per-teacher pricing.</p>
              
              <div className="mb-6 space-y-4 h-16">
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    min={1} 
                    max={100} 
                    value={teachersCount}
                    onChange={(e) => setTeachersCount(Number(e.target.value) || 1)}
                    className="w-20 text-center font-medium"
                  />
                  <span className="text-[hsl(215,16%,47%)] font-medium">teachers</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">${calculateSchoolPrice(teachersCount)}</span>
                  <span className="text-[hsl(215,16%,47%)] mb-1">/ year</span>
                </div>
                <div className="text-xs text-[hsl(174,62%,42%)] mt-2 font-medium flex items-center cursor-pointer hover:underline">
                  <ArrowRight className="w-3 h-3 mr-1" /> View volume tiers
                </div>
              </div>

              <Button className="w-full bg-white text-[hsl(222,47%,11%)] border border-gray-300 hover:bg-gray-50 rounded-xl py-6 mb-8 font-medium">
                Contact us
              </Button>
              
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-[hsl(215,16%,47%)] mb-2">Everything in Pro, plus</div>
                <FeatureItem text="Unlimited readings per teacher" />
                <FeatureItem text="All 5 languages" />
                <FeatureItem text="Admin dashboard" />
                <FeatureItem text="Usage analytics" />
                <FeatureItem text="Dedicated support" />
              </div>
            </div>
          </Card>
          
        </div>

        {/* All Plans Include */}
        <div className="mt-24 mb-32 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xl font-['Playfair_Display'] font-medium text-[hsl(215,16%,47%)]">All plans include the core LinguaFlow features</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[hsl(174,62%,42%,0.1)] text-[hsl(174,62%,42%)] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Vocabulary</h4>
              <p className="text-sm text-[hsl(215,16%,47%)]">Auto-extracted words with context</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[hsl(200,68%,52%,0.1)] text-[hsl(200,68%,52%)] flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Audio</h4>
              <p className="text-sm text-[hsl(215,16%,47%)]">High-quality native TTS voices</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[hsl(255,52%,60%,0.1)] text-[hsl(255,52%,60%)] flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Questions</h4>
              <p className="text-sm text-[hsl(215,16%,47%)]">Built-in comprehension checks</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[hsl(30,100%,50%,0.1)] text-[hsl(30,100%,50%)] flex items-center justify-center mb-4">
                <Languages className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Translation</h4>
              <p className="text-sm text-[hsl(215,16%,47%)]">Inline translation support</p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-center">Compare features side-by-side</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 font-semibold text-[hsl(215,16%,47%)] border-b border-gray-100 w-2/5">Feature</th>
                  <th className="p-6 font-semibold text-center border-b border-gray-100 w-1/5">Free</th>
                  <th className="p-6 font-semibold text-center border-b border-gray-100 w-1/5 bg-[hsl(174,62%,42%,0.03)] text-[hsl(174,62%,42%)]">Pro</th>
                  <th className="p-6 font-semibold text-center border-b border-gray-100 w-1/5">School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableRow title="Readings per month" free="10" pro="Unlimited" school="Unlimited" />
                <TableRow title="Supported languages" free="1" pro="All 5" school="All 5" />
                <TableRow title="Vocabulary highlighting" free={<CheckIcon />} pro={<CheckIcon />} school={<CheckIcon />} />
                <TableRow title="Comprehension questions" free={<CheckIcon />} pro={<CheckIcon />} school={<CheckIcon />} />
                <TableRow title="Audio (TTS) playback" free={<CrossIcon />} pro={<CheckIcon />} school={<CheckIcon />} />
                <TableRow title="CEFR level tracking" free={<CrossIcon />} pro={<CheckIcon />} school={<CheckIcon />} />
                <TableRow title="Admin dashboard" free={<CrossIcon />} pro={<CrossIcon />} school={<CheckIcon />} />
                <TableRow title="Usage analytics" free={<CrossIcon />} pro={<CrossIcon />} school={<CheckIcon />} />
                <TableRow title="Support" free="Community" pro="Priority" school="Dedicated" />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function FeatureItem({ text, highlight = false }: { text: string, highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 rounded-full p-0.5 ${highlight ? 'bg-[hsl(174,62%,42%,0.15)] text-[hsl(174,62%,42%)]' : 'bg-gray-100 text-gray-600'}`}>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </div>
      <span className={`text-sm ${highlight ? 'font-medium text-[hsl(222,47%,11%)]' : 'text-gray-700'}`}>{text}</span>
    </div>
  );
}

function TableRow({ title, free, pro, school }: { title: string, free: React.ReactNode, pro: React.ReactNode, school: React.ReactNode }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 md:px-6 font-medium text-sm text-gray-800">{title}</td>
      <td className="p-4 md:px-6 text-center text-sm text-gray-600">{free}</td>
      <td className="p-4 md:px-6 text-center text-sm font-medium bg-[hsl(174,62%,42%,0.02)] text-[hsl(174,62%,42%)]">{pro}</td>
      <td className="p-4 md:px-6 text-center text-sm text-gray-600">{school}</td>
    </tr>
  );
}

function CheckIcon() {
  return <Check className="w-5 h-5 mx-auto text-[hsl(174,62%,42%)]" />;
}

function CrossIcon() {
  return <X className="w-5 h-5 mx-auto text-gray-300" />;
}
