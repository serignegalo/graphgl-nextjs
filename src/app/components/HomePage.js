"use client";

import { React, useState, useEffect } from "react";
import UserInfos from "./UserInfos";
import Navbar from "./Navbar";
import axios from "axios";
import CurveComponent from "./CurveComponent";
import CircleComponent from "./CircleComponent";
import Link from "next/link";

export default function Home() {
  const jwt = localStorage.getItem("token");
  const [userData, setUserData] = useState({});
  const [userTransaction, setUserTransaction] = useState(null);
  const [userTransactionInfos, setUserTransactionInfos] = useState(null);
  const [upTransaction, setUpTransaction] = useState(null);
  const [downTransaction, setDownTransaction] = useState(null);
  const [ratio, setRatio] = useState([]);
  const [curveData, setCurveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapID] = useState(new Map()); // Initialize Map

  // function calculXP(obj) {
  //   let sum = 0;
  //   for (const i in obj) {
  //     sum = obj[i];
  //     console.log("object bi " + sum);
  //   }
  //   return sum;
  // }

  useEffect(() => {
    async function fetchData() {
      try {
        // Recovery infos of user
        const responseUser = await axios.post(
          "https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql",
          {
            query: `
              {
                user {
                  id
                  firstName
                  lastName
                  email
                  login
                }
              }
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        setUserData(responseUser.data.data.user[0]);

        const responseTransaction = await axios.post(
          "https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql",
          {
            query: `
              {
                transactions: transaction_aggregate(
                  where: {
                    type: { _eq: "xp" }
                    path: { _ilike: "%/dakar/div-01/%" }
                    _not: {
                      _or: [
                        { path: { _ilike: "%piscine%" } }
                      ]
                    }
                  }
                ) {
                  nodes {
                    id
                    path
                  }
                  aggregate {
                    count
                    sum {
                      amount
                    }
                  }
                }
                userTransactionInfos: transaction(
                  where: { type: { _eq: "level" }, path: { _ilike: "%/dakar/div-01/%" } },
                  order_by: { amount: desc },
                  limit: 1
                ) {
                  id
                  type
                  amount
                  objectId
                  userId
                  createdAt
                  path
                }
                upTransactions: transaction_aggregate(where: { type: { _eq: "up" } }) {
                  aggregate {
                    sum {
                      amount
                    }
                  }
                }
                  downTransactions: transaction_aggregate(where: { type: { _eq: "down" } }) {
                    aggregate {
                      sum {
                        amount
                      }
                    }
                  }
              }
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        setUserTransaction(responseTransaction.data.data.transactions);

        setUserTransactionInfos(
          responseTransaction.data.data.userTransactionInfos[0]
        );

        setUpTransaction(
          responseTransaction.data.data.upTransactions.aggregate.sum.amount
        );

        setDownTransaction(
          responseTransaction.data.data.downTransactions.aggregate.sum.amount
        );

        // setRatio([...ratio, upTransaction , downTransaction])

        // Extract transactions data and populate Map
        const transactions = responseTransaction.data.data.transactions.nodes;
        transactions.forEach((transaction) => {
          mapID.set(transaction.id, transaction.path);
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    }

    const fetchCurveData = async () => {
      try {
        // Fetch curve data
        const curveResponse = await axios.post(
          "https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql",
          {
            query: `
            query GetCurveData {
              transaction(
                where: {
                  type: { _in: ["xp"] }
                  _not: {
                    _or: [
                      { path: { _ilike: "%piscine%" } }
                      { path: { _ilike: "%checkpoint%" } }
                    ]
                  }
                }
                order_by: { createdAt: asc }
              ) {
                id
                amount
                path
              }
            }
            
            `,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setCurveData(curveResponse.data.data.transaction);
      } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "http://localhost:3000/";
        console.error("Error fetching curve data:", error);
      }
    };

    fetchData();
    fetchCurveData();
  }, []);

  return (
    <>
      {!jwt ? (
        <Link href="/"></Link>
      ) : (
        <div className="font-mono">
          <nav className="flex items-center h-[60px]">
            <Navbar />
          </nav>
          <main className="bg-white-200 h-[100vh]">
            {loading ? (
              <p>loading...</p>
            ) : (
              <>
                <UserInfos
                  infosUser={userData}
                  userTransaction={userTransaction.aggregate.sum.amount}
                  userTransactionInfos={userTransactionInfos}
                  curveData={curveData}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <CurveComponent
                      transactionsData={curveData}
                      mapID={mapID}
                      className="w-full max-w-60"
                    />
                  </div>
                  <div className="bg-gray-200 h-[490px] flex items-center rounded-lg m-5">
                    <CircleComponent
                      upTransaction={upTransaction}
                      downTransaction={downTransaction}
                    />
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      )}
      <footer className=""></footer>
    </>
  );
}
