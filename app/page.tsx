"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, Dispatch, SetStateAction, MutableRefObject, Fragment } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TerminalContact = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1482686115713-0fbcaced6e28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1734&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="px-4 py-12 bg-violet-600"
    >
      <div
        ref={containerRef}
        onClick={() => {
          inputRef.current?.focus();
        }}
        className="h-96 bg-slate-950/70 backdrop-blur rounded-lg w-full max-w-3xl mx-auto overflow-y-scroll shadow-xl cursor-text font-mono"
      >
        <TerminalHeader />
        <TerminalBody inputRef={inputRef} containerRef={containerRef} />
      </div>
    </section>
  );
};

const TerminalHeader = () => {
  return (
    <div className="w-full p-3 bg-slate-900 flex items-center gap-1 sticky top-0">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
      <span className="text-sm text-slate-200 font-semibold absolute left-[50%] -translate-x-[50%]">
        contact@dev
      </span>
    </div>
  );
};

const TerminalBody = ({ containerRef, inputRef }: TerminalBodyProps) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState(QUESTIONS);

  const curQuestion = questions.find((q) => !q.complete);

  const validateInput = (value: string) => {
    if (curQuestion?.key === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? "" : "Invalid email format.";
    } else if (curQuestion?.key === "plan") {
      const validPlans = ["M", "A", "L"];
      return validPlans.includes(value) ? "" : "Invalid plan. Choose M, A, or L.";
    }
    return "";
  };

  const handleSubmitLine = (value: string) => {
    const validationError = validateInput(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    if (curQuestion) {
      setQuestions((pv) =>
        pv.map((q) => {
          if (q.key === curQuestion.key) {
            return {
              ...q,
              complete: true,
              value,
            };
          }
          return q;
        })
      );
      setText("");  // Clear the input after submission
    }
  };

  useEffect(() => {
    if (curQuestion?.key === "plan") {
      let index = 0;
      const textToType = "";
      const intervalId = setInterval(() => {
        if (index < textToType.length) {
          setText((prev) => prev + textToType[index]);
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [curQuestion]);

  return (
    <div className="p-2 text-slate-100 text-lg">
      <InitialText />
      <PreviousQuestions questions={questions} />
      <CurrentQuestion curQuestion={curQuestion} />
      {curQuestion ? (
        <CurLine
          text={text}
          focused={focused}
          setText={setText}
          setFocused={setFocused}
          inputRef={inputRef}
          command={curQuestion?.key || ""}
          handleSubmitLine={handleSubmitLine}
          containerRef={containerRef}
        />
      ) : (
        <Summary questions={questions} setQuestions={setQuestions} />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

const InitialText = () => {
  return (
    <>
      <p>Hey there! We're excited to link 🔗</p>
      <p className="whitespace-nowrap overflow-hidden font-light">
        ------------------------------------------------------------------------
      </p>
    </>
  );
};

const PreviousQuestions = ({ questions }: PreviousQuestionProps) => {
  return (
    <>
      {questions.map((q, i) => {
        if (q.complete) {
          return (
            <Fragment key={i}>
              <p>
                {q.text || ""}
                {q.postfix && (
                  <span className="text-violet-300">{q.postfix}</span>
                )}
              </p>
              <p className="text-emerald-300">
                <FiCheckCircle className="inline-block mr-2" />
                <span>{q.value}</span>
              </p>
            </Fragment>
          );
        }
        return <Fragment key={i}></Fragment>;
      })}
    </>
  );
};

const CurrentQuestion = ({ curQuestion }: CurrentQuestionProps) => {
  if (!curQuestion) return <></>;

  return (
    <p>
      {curQuestion.text || ""}
      {curQuestion.postfix && (
        <span className="text-violet-300">{curQuestion.postfix}</span>
      )}
    </p>
  );
};

const Summary = ({ questions, setQuestions }: SummaryProps) => {
  const [complete, setComplete] = useState(false);

  const handleReset = () => {
    setQuestions((pv) => pv.map((q) => ({ ...q, value: "", complete: false })));
  };

  const handleSend = async () => {
    const formData: { email: string; plan: string } = questions.reduce(
      (acc, val) => {
        return { ...acc, [val.key]: val.value };
      },
      { email: "", plan: "" }
    );

    // Save initial entry to MongoDB with paid set to false
    const saveResponse = await fetch("/api/save-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, paid: false }),
    });

    if (!saveResponse.ok) {
      const saveError = await saveResponse.json();
      saveError(saveError.error);
      return;
    }

    const apiEndpoint =
      formData.plan === "M"
        ? "/api/monthly"
        : formData.plan === "A"
        ? "/api/annual"
        : "/api/direct";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "email": formData.email, // Pass email in the headers
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      console.log("API response:", data);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        subscription_id: data.id, // Use subscription_id for monthly and annual plans
        amount: formData.plan === "L" ? 6000000 : undefined, // Amount in paise for direct checkout
        currency: "INR",
        name: "Your Company Name",
        description:
          formData.plan === "L"
            ? "Lifetime Subscription"
            : "Subscription",
        order_id:
          formData.plan === "L" ? data.id : undefined, // Use order_id for direct checkout
        handler: async function (response: any) {
          alert("Payment successful");
          console.log(response);

          // Update the MongoDB entry to set paid to true
          await fetch("/api/update-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              paid: true,
              planId: data.id,
              quantity: data.quantity,
              currentStart: data.start_at,
              currentEnd: data.end_at,
            }),
          });
        },
        prefill: {
          name: "John Doe",
          email: formData.email,
          contact: "9999999999",
        },
        notes: {
          address: "Your Company Address",
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
    }

    setComplete(true);
  };

  return (
    <>
      <p>Great! Here's what we've got:</p>
      {questions.map((q) => {
        return (
          <p key={q.key}>
            <span className="text-blue-300">{q.key}:</span> {q.value}
          </p>
        );
      })}
      <p>Looking good?</p>
      {complete ? (
        <p className="text-emerald-300">
          <FiCheckCircle className="inline-block mr-2" />
          <span>Done! Please check your email</span>
        </p>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 text-base hover:opacity-90 transition-opacity rounded bg-slate-100 text-black"
          >
            Restart
          </button>
          <button
            onClick={handleSend}
            className="px-3 py-1 text-base hover:opacity-90 transition-opacity rounded bg-indigo-500 text-white"
          >
            Send it!
          </button>
        </div>
      )}
    </>
  );
};

const CurLine = ({
  text,
  focused,
  setText,
  setFocused,
  inputRef,
  command,
  handleSubmitLine,
  containerRef,
}: CurrentLineProps) => {
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitLine(text);
    setText("");
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    scrollToBottom();
  };

  useEffect(() => {
    return () => setFocused(false);
  }, []);

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          onChange={onChange}
          value={text}
          type="text"
          className="sr-only"
          autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </form>
      <p>
        <span className="text-emerald-400">➜</span>{" "}
        <span className="text-cyan-300">~</span>{" "}
        {command && <span className="opacity-50">Enter {command}: </span>}
        {text}
        {focused && (
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear",
              times: [0, 0.5, 0.5, 1],
            }}
            className="inline-block w-2 h-5 bg-slate-400 translate-y-1 ml-0.5"
          />
        )}
      </p>
    </>
  );
};

export default function Home() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <TerminalContact />
    </>
  );
}

const QUESTIONS: QuestionType[] = [
  {
    key: "email",
    text: "To start, could you give us ",
    postfix: "your email?",
    complete: false,
    value: "",
  },
  {
    key: "plan",
    text: "Great! Which plan would you like to subscribe to? Choose M (Monthly @2500), A (Annual @1800), or L (Lifetime @60000)",
    complete: false,
    value: "",
    options: [],
  },
];

interface CurrentLineProps {
  text: string;
  focused: boolean;
  setText: Dispatch<SetStateAction<string>>;
  setFocused: Dispatch<SetStateAction<boolean>>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  command: string;
  handleSubmitLine: Function;
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

type QuestionType = {
  key: string;
  text: string;
  postfix?: string;
  complete: boolean;
  value: string;
  options?: { value: string; label: string }[];
};

interface TerminalBodyProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
}

interface PreviousQuestionProps {
  questions: QuestionType[];
}

interface SummaryProps {
  questions: QuestionType[];
  setQuestions: Dispatch<SetStateAction<QuestionType[]>>;
}

interface CurrentQuestionProps {
  curQuestion: QuestionType | undefined;
}
