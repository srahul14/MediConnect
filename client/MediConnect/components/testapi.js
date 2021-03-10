const axios = require('axios');

axios
	.post('http://54.183.200.234:5000/doctor/signin', {
		// axios
		// 	.post('http://localhost:5000/doctor/signin', {
		email: 'alexjones@gmail.com',
		password: '12345678',
	})
	.then((res) => {
		console.log(res.data);

		// CookieManager.get("http://54.183.200.234:5000/doctor/signin")
		//     .then((res) => {
		//         console.log('CookieManager.get =>', res); // => 'user_session=abcdefg; path=/;'
		//     });
	})
	.catch((err) => {
		console.log(err.response.data);
		// alert(err.response.data.email + '\n' + err.response.data.password);
	});
