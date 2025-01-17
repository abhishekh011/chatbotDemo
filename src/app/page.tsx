"use client";
import React, { useState } from "react";

interface Message {
  type: "user" | "bot";
  content: string;
  options?: string[];
}

const knowledgeBase = {
  symptoms: {
    pain: [
      "How severe is your knee pain on a scale of 1-10?",
      "Is the pain constant or intermittent?",
    ],
    swelling: ["Is there visible swelling?", "When did the swelling start?"],
    mobility: [
      "Can you fully bend and straighten your knee?",
      "Does your knee lock or give way?",
    ],
  },
  eligibility: {
    age: "What is your age?",
    previousSurgery: "Have you had any previous knee surgeries?",
    treatments: "Have you tried conservative treatments like physical therapy?",
  },
  nextSteps: {
    eligible:
      "Based on your responses, you may be a candidate for knee surgery. Would you like to proceed with the KOOS survey?",
    ineligible:
      "Based on your responses, we recommend scheduling a consultation with our physical therapy team first.",
    emergency:
      "Your symptoms suggest you should seek immediate medical attention.",
  },
};

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content:
        "Hello! I'm here to help assess your knee condition. Would you like to start the evaluation?",
      options: ["Yes, start evaluation", "No, maybe later"],
    },
  ]);
  const [userResponses, setUserResponses] = useState<any>({});
  const [currentStep, setCurrentStep] = useState("initial");

  const processResponse = (response: string) => {
    setMessages((prev) => [...prev, { type: "user", content: response }]);
    setUserResponses((prev: any) => ({ ...prev, [currentStep]: response }));

    let nextMessage: Message;
    switch (currentStep) {
      case "initial":
        if (response === "Yes, start evaluation") {
          nextMessage = {
            type: "bot",
            content: knowledgeBase.eligibility.age,
            options: ["Under 18", "18-40", "41-60", "Over 60"],
          };
          setCurrentStep("age");
        } else {
          nextMessage = {
            type: "bot",
            content: "No problem! Feel free to return when you're ready.",
            options: ["Start Over"],
          };
        }
        break;
      case "age":
        nextMessage = {
          type: "bot",
          content: "How severe is your knee pain on a scale of 1-10?",
          options: ["1-3 (Mild)", "4-7 (Moderate)", "8-10 (Severe)"],
        };
        setCurrentStep("pain");
        break;
      case "pain":
        nextMessage = {
          type: "bot",
          content: knowledgeBase.eligibility.previousSurgery,
          options: ["Yes", "No"],
        };
        setCurrentStep("surgery");
        break;
      case "surgery":
        nextMessage = {
          type: "bot",
          content: knowledgeBase.eligibility.treatments,
          options: ["Yes", "No"],
        };
        setCurrentStep("treatments");
        break;
      case "treatments":
        const isEligible = evaluateEligibility(userResponses);
        nextMessage = {
          type: "bot",
          content: isEligible
            ? knowledgeBase.nextSteps.eligible
            : knowledgeBase.nextSteps.ineligible,
          options: isEligible
            ? ["Take KOOS Survey", "Schedule Consultation"]
            : ["Schedule PT", "Start Over"],
        };
        setCurrentStep("recommendation");
        break;
      case "recommendation":
        if (response === "Take KOOS Survey") {
          nextMessage = {
            type: "bot",
            content:
              "Great! Here's the link to the KOOS survey: [KOOS Survey Link]. After completing the survey, our team will review your responses and contact you.",
            options: ["Start Over"],
          };
        } else if (
          response === "Schedule PT" ||
          response === "Schedule Consultation"
        ) {
          nextMessage = {
            type: "bot",
            content:
              "I'll help you schedule an appointment. Please click here to access our scheduling system: [Scheduling Link]",
            options: ["Start Over"],
          };
        }
        setCurrentStep("final");
        break;
      default:
        nextMessage = {
          type: "bot",
          content: "Would you like to start over?",
          options: ["Start Over"],
        };
        setCurrentStep("initial");
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, nextMessage]);
    }, 500);
  };

  const evaluateEligibility = (responses: { pain?: any; treatments?: any }) => {
    if (responses.pain === "8-10 (Severe)" && responses.treatments === "Yes") {
      return true;
    }
    return false;
  };

  const handleReset = () => {
    setMessages([messages[0]]);
    setUserResponses({});
    setCurrentStep("initial");
  };

  return (
    <div className=" bg-gray-100 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white">
            Knee Surgery Assessment
          </h2>
          <p className="text-blue-100 mt-2">
            Answer a few questions to evaluate your condition
          </p>
        </div>

        <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white shadow-md text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-center">
            {messages[messages.length - 1]?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  option === "Start Over"
                    ? handleReset()
                    : processResponse(option)
                }
                className={`px-6 py-2.5 rounded-lg transition-colors duration-200 ${
                  option === "Start Over"
                    ? "border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
