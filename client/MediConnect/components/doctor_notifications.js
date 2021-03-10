import React from 'react';
import {Component} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import axios from 'axios';

class DoctorNotifications extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notifsSelect: [],
			notifs: [],
			notifsIDs: [],
		};

		// this.state.notifs =  [["notif1", "notif 1 body"], ["notif2", "notif 2 body"], ["notif3", "notif 3 body"]]

		// console.log("Cookie" +global.jwt);

		axios
			// .get('http://10.0.2.2:5000/doctor/notif/' + global.userID,
			.get(
				'http://54.176.99.202:5000/doctor/notif/' + global.userID,

				{},
				{headers: {Cookie: global.jwt}},
			)
			.then((res) => {
				this.setState({
					notifs: Object.values(res.data.notifications),
				});

				console.log(res.data.notifications);
				var d = Object.values(res.data.notifications)[0];
				console.log('Getting notifications ' + d.text);

				for (var i = 0; i < this.state.notifs.length; i++) {
					this.state.notifsSelect[i] = false;
					this.state.notifsIDs[i] = this.state.notifs[i]._id;
					// console.log(this.state.notifsIDs[i])
				}
			})
			.catch((err) => {
				console.log(err.response.data);
			});
	}

	switchCheck(count) {
		// this.setState({
		this.state.notifsSelect[count] = !this.state.notifsSelect[count];
		// });
		this.forceUpdate();

		console.log(count);
	}

	// testNotif = () => {
	// 	console.log("Inside test notif")
	// 	// PushNotification.localNotification({
	// 	// 	title: "My Notification Title", // (optional)
	// 	// 	message: "My Notification Message", // (required)
	// 	//   });
	// 	Notifications.postLocalNotification({
	// 		title: "Local notification",
	// 		body: "hey kk!",
	// 		// sound: "chime.aiff",
	// 		silent: false,

	// 	})
	// }

	allRead = () => {
		for (var i = 0; i < this.state.notifs.length; i++) {
			axios
				// .get('http://10.0.2.2:5000/doctor/notif/' + global.userID,
				.delete(
					'http://54.176.99.202:5000/doctor/notif/' + this.state.notifsIDs[i],
					{},
					{headers: {Cookie: global.jwt}},
				)
				.then((res) => {})
				.catch((err) => {
					console.log(err.response.data);
				});
		}

		this.setState({
			notifs: [],
			notifsSelect: [],
			notifsIDs: [],
		});

		this.forceUpdate();
	};

	someRead = () => {
		for (var i = 0; i < this.state.notifs.length; i++) {
			if (this.state.notifsSelect[i] === true) {
				axios
					// .get('http://10.0.2.2:5000/doctor/notif/' + global.userID,
					.delete(
						'http://54.176.99.202:5000/doctor/notif/' + this.state.notifsIDs[i],
						{},
						{headers: {Cookie: global.jwt}},
					)
					.then((res) => {})
					.catch((err) => {
						console.log(err.response.data);
					});

				this.state.notifs.splice(i, 1);
				this.state.notifsSelect.splice(i, 1);
				this.state.notifsIDs.splice(i, 1);
				i = -1;
			}
		}

		// this.state.setState.splice(index, 1);
		// console.log(this.state.notifs)
		// console.log(this.state.notifsSelect)

		this.forceUpdate();

		// remove from backend as well!!!!!!!!!!
	};

	render() {
		let notifsRender;

		if (this.state.notifs.length === 0) {
			notifsRender = (
				<View style={styles.noNotifsContainer}>
					<Text style={styles.noNotifs}>You have no notifications</Text>
				</View>
			);
		} else {
			notifsRender = this.state.notifs.map((notif, count) => (
				<View key={count}>
					<TouchableOpacity
						style={styles.option}
						onPress={() => this.switchCheck(count)}
					>
						<CheckBox
							checked={this.state.notifsSelect[count]}
							uncheckedColor="white"
							checkedColor="#5c5c5c"
							// onPress={this.switchTaskDone(count)}
						/>
						<View style={styles.optionCont}>
							<Text style={styles.optionText}>{notif.title}</Text>
							<Text style={styles.optionBody}>{notif.text}</Text>
						</View>
					</TouchableOpacity>
				</View>
			));
		}

		return (
			<ScrollView style={styles.scroll}>
				<View style={styles.container}>{notifsRender}</View>
				<View style={styles.buttonsContainer}>
					<TouchableOpacity style={styles.button} testID="Notifications_Page">
						<Text style={styles.buttonText} onPress={() => this.someRead()}>
							Mark selected as read
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.button}
						onPress={() => this.allRead()}
					>
						<Text style={styles.buttonText}>Mark all as read</Text>
					</TouchableOpacity>

					{/* <TouchableOpacity style={styles.button} onPress={()=>this.testNotif()}>
						<Text style={styles.buttonText}>test notifffssssssss</Text>
					</TouchableOpacity> */}
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	scroll: {
		backgroundColor: 'white',
	},

	container: {
		padding: 30,
		backgroundColor: 'white',
	},

	icon: {
		width: 50,
		justifyContent: 'center',
	},

	option: {
		padding: 10,
		borderColor: '#02f0c8',
		borderRadius: 7,
		backgroundColor: '#d9d9d9',
		alignItems: 'center',
		margin: 10,
		flexDirection: 'row',
		width: 320,
		// height: 50,
	},

	optionCont: {
		width: 230,
	},

	buttonsContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	button: {
		backgroundColor: '#02f0c8',
		padding: 10,
		margin: 5,
		height: 40,
		shadowColor: 'black',
		borderRadius: 7,
		width: 250,
		alignItems: 'center',
		justifyContent: 'center',
	},

	buttonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 17,
		color: '#5c5c5c',
	},

	optionText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 15,
		color: '#5c5c5c',
	},

	optionBody: {
		fontFamily: 'Iowan Old Style',
		fontSize: 13,
		color: '#5c5c5c',
	},

	noNotifs: {
		fontFamily: 'Iowan Old Style',
		fontSize: 20,
		color: '#5c5c5c',
	},

	noNotifsContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default DoctorNotifications;
