import {
  faArrowDown,
  faArrowDown19,
  faArrowDownAZ,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Row from "./Row";
import Columns from "./Columns";
import ImportExcel from "../components/ImportExcel";

const View = ({ type, created, deleted }) => {
  const data = [
    {
      id: 1,
      first_name: "Dudley",
      last_name: "Leahey",
      email: "dleahey0@sina.com.cn",
    },
    {
      id: 2,
      first_name: "Susannah",
      last_name: "Tees",
      email: "stees1@merriam-webster.com",
    },
    {
      id: 3,
      first_name: "Nola",
      last_name: "Stockley",
      email: "nstockley2@sohu.com",
    },
    {
      id: 4,
      first_name: "Baudoin",
      last_name: "Probbin",
      email: "bprobbin3@npr.org",
    },
    {
      id: 5,
      first_name: "Bary",
      last_name: "Fullagar",
      email: "bfullagar4@mysql.com",
    },
    {
      id: 6,
      first_name: "Fleurette",
      last_name: "Moreinu",
      email: "fmoreinu5@ucoz.ru",
    },
    {
      id: 7,
      first_name: "Annelise",
      last_name: "Tallow",
      email: "atallow6@reddit.com",
    },
    {
      id: 8,
      first_name: "Geordie",
      last_name: "Jillard",
      email: "gjillard7@quantcast.com",
    },
    {
      id: 9,
      first_name: "Kevina",
      last_name: "Gascard",
      email: "kgascard8@disqus.com",
    },
    {
      id: 10,
      first_name: "Consuelo",
      last_name: "Priddis",
      email: "cpriddis9@auda.org.au",
    },
    {
      id: 11,
      first_name: "Shirleen",
      last_name: "Yesson",
      email: "syessona@sina.com.cn",
    },
    {
      id: 12,
      first_name: "Susi",
      last_name: "Cayzer",
      email: "scayzerb@google.es",
    },
    {
      id: 13,
      first_name: "Arlan",
      last_name: "Culkin",
      email: "aculkinc@google.fr",
    },
    {
      id: 14,
      first_name: "Allison",
      last_name: "Crosetti",
      email: "acrosettid@miibeian.gov.cn",
    },
    {
      id: 15,
      first_name: "Wynnie",
      last_name: "Dennerley",
      email: "wdennerleye@spiegel.de",
    },
    {
      id: 16,
      first_name: "Beitris",
      last_name: "Haggar",
      email: "bhaggarf@alexa.com",
    },
    {
      id: 17,
      first_name: "Archambault",
      last_name: "Dullaghan",
      email: "adullaghang@quantcast.com",
    },
    {
      id: 18,
      first_name: "Norine",
      last_name: "Tooze",
      email: "ntoozeh@spotify.com",
    },
    {
      id: 19,
      first_name: "Anthea",
      last_name: "Alan",
      email: "aalani@upenn.edu",
    },
    {
      id: 20,
      first_name: "Geneva",
      last_name: "Worden",
      email: "gwordenj@businessinsider.com",
    },
  ];

  return (
    <div
      className={`w-full relative ${
        type !== "" ? "flex" : "hidden"
      }  flex-col justify-center items-center animate-fade ${
        deleted && "animate-fadeOut"
      } [animation-fill-mode:backwards]`}
      style={{ animationDelay: created ? "0.2s" : "0s" }}
    >
      <div className="w-full relative min-h-125 shadow-2 bg-white flex flex-col">
        <div className="w-full sticky flex items-center justify-between bg-white py-4 px-8 sm:px-4">
          <h1 className={`flex text-xl font-semibold overflow-hidden`}>
            {type.split("").map((char, index) => {
              return (
                <p
                  className="animate-textReveal [animation-fill-mode:backwards]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  key={`${char}-${index}`}
                >
                  {char === " " ? "\u00A0" : char}{" "}
                </p>
              );
            })}
          </h1>
        </div>
        <span className="w-full h-[1px] bg-slate-200"></span>
        <Columns data={data[0]} />
        <span className="w-full h-[0.5px] bg-slate-200"></span>
        <ImportExcel />
        {data.map((element, index) => {
          return <Row element={element} index={index} key={index} />;
        })}
      </div>
    </div>
  );
};

export default View;
