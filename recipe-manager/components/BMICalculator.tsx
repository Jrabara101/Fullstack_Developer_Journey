'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaCalculator, FaWeight, FaRuler } from 'react-icons/fa';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BMICalculator() {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [bmi, setBmi] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const sectionRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(sectionRef.current.children, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, []);

  useEffect(() => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi);

    if (calculatedBmi < 18.5) {
      setCategory('Underweight');
    } else if (calculatedBmi < 25) {
      setCategory('Normal weight');
    } else if (calculatedBmi < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }

    if (resultRef.current) {
      gsap.from(resultRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      });
    }
  }, [height, weight]);

  const getCategoryColor = () => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <section
      id="bmi"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-purple-50 min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800">
            <FaCalculator className="inline mr-3 text-purple-600" />
            BMI Calculator
          </h2>

          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-3 text-gray-700">
                  <FaRuler /> Height: {height} cm
                </label>
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>100 cm</span>
                  <span>220 cm</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-lg font-semibold mb-3 text-gray-700">
                  <FaWeight /> Weight: {weight} kg
                </label>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>30 kg</span>
                  <span>200 kg</span>
                </div>
              </div>

              {bmi > 0 && (
                <div
                  ref={resultRef}
                  className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg"
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Your BMI</p>
                    <p className={`text-5xl font-bold mb-2 ${getCategoryColor()}`}>
                      {bmi.toFixed(1)}
                    </p>
                    <p className={`text-xl font-semibold ${getCategoryColor()}`}>
                      {category}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
