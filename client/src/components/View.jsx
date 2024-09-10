import {
  faArrowDown19,
  faArrowDownAZ,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Row from "./Row";

const View = ({ type, created, deleted }) => {
  const data = [
    {
      id: 1,
      firstName: "Dudley",
      lastName: "Leahey",
      email: "dleahey0@sina.com.cn",
    },
    {
      id: 2,
      firstName: "Susannah",
      lastName: "Tees",
      email: "stees1@merriam-webster.com",
    },
    {
      id: 3,
      firstName: "Nola",
      lastName: "Stockley",
      email: "nstockley2@sohu.com",
    },
    {
      id: 4,
      firstName: "Baudoin",
      lastName: "Probbin",
      email: "bprobbin3@npr.org",
    },
    {
      id: 5,
      firstName: "Bary",
      lastName: "Fullagar",
      email: "bfullagar4@mysql.com",
    },
    {
      id: 6,
      firstName: "Fleurette",
      lastName: "Moreinu",
      email: "fmoreinu5@ucoz.ru",
    },
    {
      id: 7,
      firstName: "Annelise",
      lastName: "Tallow",
      email: "atallow6@reddit.com",
    },
    {
      id: 8,
      firstName: "Geordie",
      lastName: "Jillard",
      email: "gjillard7@quantcast.com",
    },
    {
      id: 9,
      firstName: "Kevina",
      lastName: "Gascard",
      email: "kgascard8@disqus.com",
    },
    {
      id: 10,
      firstName: "Consuelo",
      lastName: "Priddis",
      email: "cpriddis9@auda.org.au",
    },
    {
      id: 11,
      firstName: "Shirleen",
      lastName: "Yesson",
      email: "syessona@sina.com.cn",
    },
    {
      id: 12,
      firstName: "Susi",
      lastName: "Cayzer",
      email: "scayzerb@google.es",
    },
    {
      id: 13,
      firstName: "Arlan",
      lastName: "Culkin",
      email: "aculkinc@google.fr",
    },
    {
      id: 14,
      firstName: "Allison",
      lastName: "Crosetti",
      email: "acrosettid@miibeian.gov.cn",
    },
    {
      id: 15,
      firstName: "Wynnie",
      lastName: "Dennerley",
      email: "wdennerleye@spiegel.de",
    },
    {
      id: 16,
      firstName: "Beitris",
      lastName: "Haggar",
      email: "bhaggarf@alexa.com",
    },
    {
      id: 17,
      firstName: "Archambault",
      lastName: "Dullaghan",
      email: "adullaghang@quantcast.com",
    },
    {
      id: 18,
      firstName: "Norine",
      lastName: "Tooze",
      email: "ntoozeh@spotify.com",
    },
    {
      id: 19,
      firstName: "Anthea",
      lastName: "Alan",
      email: "aalani@upenn.edu",
    },
    {
      id: 20,
      firstName: "Geneva",
      lastName: "Worden",
      email: "gwordenj@businessinsider.com",
    },
  ];
  return (
    <div
      className={`w-full ${
        type !== "" ? "flex" : "hidden"
      }  flex-col justify-center items-center animate-fade ${
        deleted && "animate-fadeOut"
      } [animation-fill-mode:backwards]`}
      style={{ animationDelay: created ? "0.2s" : "0s" }}
    >
      <div className="w-full relative min-h-125 shadow-2 bg-white flex flex-col">
        <div className="w-full flex items-center justify-between bg-white py-4 px-8 sm:px-4">
          <h1 className={`text-xl font-semibold animate-slideDown`}>{type}</h1>
        </div>
        <span className="w-full h-[1px] bg-slate-200"></span>
        <div className="w-full py-6 px-8 sm:px-4 flex items-center justify-between bg-white gap-4">
          <p
            className={`w-1/3 md:w-3/5 text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700 duration-150 ease-linear`}
          >
            Name
            <FontAwesomeIcon
              icon={faArrowDownAZ}
              className="relative w-5 h-5 left-5"
            />
          </p>
          <p
            className={`w-1/6 relative text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700 duration-150 ease-linear `}
          >
            Email
            <FontAwesomeIcon
              icon={faArrowDown19}
              className="relative w-5 h-5 left-5"
            />
          </p>
        </div>
        <span className="w-full h-[0.5px] bg-slate-200"></span>
        {data.map((element) => {
          return (
            <Row
              id={element.id}
              firstName={element.firstName}
              lastName={element.lastName}
              email={element.email}
              key={element.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default View;
