const axios = require("axios");

axios.defaults.withCredentials = true;

// axios
//   .get("http://54.183.200.234:5000/doctor")
//   .then((res) => {
//     console.log(res.data);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// axios
//   .post("http://54.183.200.234:5000/doctor/signin", {
//     first_name: "Luigi",
//     last_name: "Scared",
//     email: "luigi@gmail.com",
//     password: "cowardly",
//   })
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));

// axios
//   .post("http://localhost:5000/patient/signup", {
//     first_name: "Falcon",
//     last_name: "Punch",
//     email: "falcon@gmail.com",
//     password: "smashbros",
//     age: 40,
//     specialization: "Neurology",
//     years_of_experience: 20,
//     verified: true,
//   })
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err.response.data));

// axios
//   .post("http://localhost:5000/patient/signin", {
//     email: "johnsmith@gmail.com",
//     password: "password",
//   })
//   .then((res) => {
//     const cookie = res.headers["set-cookie"];

//     console.log(cookie);

//     axios
//       .get("http://localhost:5000/doctor/5fbb9510410d8eb956c9a130", {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           cookie: cookie,
//         },
//       })
//       .then((res) => console.log(res.data))
//       .catch((err) => console.log(err));
//   })
//   .catch((err) => console.log(err));

// axios
//   .post("http://localhost:5000/patient/search", {
//     symptoms: ["pain chest", "shortness of breath", "asthenia"],
//   })
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));

// axios
//   .put("http://localhost:5000/doctor/5f9a72292614191b8231ce1c", {
//     age: "30",
//   })
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));

// axios
//   .get("http://localhost:5000/patient/pay")
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));

// axios
//   .delete("http://localhost:5000/doctor/5f9d10bb7a3444a4ab75eb62")
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));

// axios
//   .get("http://localhost:5000/patient/appointment/5f9d10bc7a3444a4ab75ebb")
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

axios
  .post("http://localhost:5000/patient/signup", {
    first_name: "ll",
    last_name: "wow",
    email: "lmao@gmail.com",
    password: "password",
  })
  .then((res) => {
    const cookie = res.headers["set-cookie"];
    let userId = res.data.user;

    axios
      .post(
        `http://localhost:5000/patient/notif/`,
        {
          userId: userId,
          title: "WOW",
          text: "COOL",
        },
        {
          headers: { Cookie: cookie },
        }
      )
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    // axios
    //   .post(
    //     "http://localhost:5000/patient/appointment",
    //     {
    //       patientId: "5fc77a56a665ba44ea1dbe24",
    //       doctorId: "5fc77a57a665ba44ea1dbe2c",
    //       start_time: new Date(2020, 11, 3, 9, 23),
    //       end_time: new Date(2020, 11, 3, 9, 23),
    //     },
    //     {
    //       headers: {
    //         Cookie: cookie,
    //       },
    //     }
    //   )
    //   .then((res) => console.log(res))
    //   .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));

// axios
//   .delete("http://localhost:5000/patient/appointment/5f9d18b8aec0303aa5f6070d")
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

// axios
//   .put("http://localhost:5000/patient/appointment/5f9d1d5a1fbc1993c61f8a76", {
//     start_time: new Date(2020, 11, 20, 11, 0),
//     end_time: new Date(2020, 11, 20, 12, 0),
//   })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

// axios
//   .post("http://localhost:5000/doctor/signin", {
//     email: "toraamodt@gmail.com",
//     password: "CPEN211HELL",
//   })
//   .then((res) => {
//     const cookie = res.headers["set-cookie"];
//     const userId = res.data.user;

//     axios
//       .post(
//         "http://localhost:5000/doctor/notif",
//         {
//           userId: userId,
//           title: "Another Title",
//           text: "Another text",
//         },
//         {
//           headers: {
//             Cookie: cookie,
//           },
//         }
//       )
//       .then((res) => console.log(res))
//       .catch((err) => console.log(err));
//   })
//   .catch((err) => console.log(err));

// axios
//   .post("http://localhost:5000/patient/signin", {
//     email: "johnsmith@gmail.com",
//     password: "password",
//   })
//   .then((res) => {
//     const cookie = res.headers["set-cookie"];
//     const userId = res.data.user;

//     axios
//       .delete(
//         "http://localhost:5000/patient/notif/555fc77c04048621642b002c16",
//         {
//           headers: {
//             Cookie: cookie,
//           },
//         }
//       )
//       .then((res) => console.log(res.data))
//       .catch((err) => console.log(err));
//   })
//   .catch((err) => console.log(err));
