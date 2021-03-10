import React from 'react';
import 'react-native-paper';
import {Component} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
} from 'react-native';
import stripe from 'tipsi-stripe';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

class PatientPayment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			client_secret: '',
			intent_id: '',
			key: '',
			name: '',
			line1: '',
			line2: '',
			city: '',
			state: '',
			country: '',
			postalCode: '',
			update: false,
		};
	}

	componentDidMount() {
		// stripe.setOptions({
		//     publishableKey: 'PUBLISHABLE_KEY'
		// })

		axios.post('http://54.176.99.202:5000/patient/pay', {}).then((res) => {
			console.log(res.data);
			this.setState({
				client_secret: res.data.client_secret,
				intent_id: res.data.intent_id,
				key: res.data.key,
			});
			// console.log(this.state.client_secret)
			// })
			// .catch((err) => {
			// 	console.log(err.response.data);
			// });
		});
	}

	async enterDetails() {
		await stripe.setOptions({
			publishableKey: this.state.key,
			// publishableKey: 'pk_test_51Hq5lFCtCqrc6bMbbtRc4piee3sFgVehdWROY9pnYBgxKSXqjH28o9OphIQpiAh12vUXK8sGb4Ec3y5DF9YYvsoC00olyk8YPP'
		});

		// console.log(this.state.key)

		try {
			if (
				this.state.name !== '' &&
				this.state.line1 !== '' &&
				this.state.city !== '' &&
				this.state.state !== '' &&
				this.state.country !== '' &&
				this.state.postalCode !== ''
			) {
				console.log(this.state.line1);
				console.log(this.state.line2);
				console.log(this.state.city);
				console.log(this.state.state);
				console.log(this.state.country);
				console.log(this.state.postalCode);

				const paymentMethod = await stripe.paymentRequestWithCardForm({
					requiredBillingAddressFields: 'full',
					prefilledInformation: {
						billingAddress: {
							name: this.state.name,
							line1: this.state.line1,
							line2: this.state.line2,
							city: this.state.city,
							state: this.state.country,
							country: this.state.country,
							postalCode: this.state.postalCode,
							email: global.email,
							// name: 'Gunilla Haugeh',
							// line1: 'Canary Place',
							// line2: '3',
							// city: 'Macon',
							// state: 'Georgia',
							// country: 'US',
							// postalCode: '31217',
							// email: 'ghaugeh0@printfriendly.com',
						},
					},
					theme: {
						primaryBackgroundColor: '#02d9b5',
					},
				});

				console.log(paymentMethod);

				this.props.navigation.navigate('PatientHomeNavigator');

				// alert('Payment Successful!');
			}

			// navigate to the home page

			// stripe.confirmPaymentIntent({
			//     state.client_secret,
			//     paymentMethodId: paymentMethod.id, // Assuming your payment card form has the billingDetails and card: {} properties

			// });
		} catch (error) {
			console.log(error);
			console.log('err');
		}
	}

	render() {
		return (
			<ScrollView style={styles.container}>
				<View style={styles.pageHeader}>
					<Icon
						style={styles.icon}
						name="address-card"
						size={30}
						color={'#5c5c5c'}
					/>
					<Text style={styles.pageHeaderText}>Billing Address</Text>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Name</Text>
					<TextInput
						style={styles.text}
						placeholder={'Firstname Lastname'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({name: text})}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Address</Text>
					<TextInput
						style={styles.text}
						placeholder={'Address Line 1'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({line1: text})}
						required
					/>

					<TextInput
						style={styles.text}
						placeholder={'Address Line 2'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({line2: text})}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>City</Text>
					<TextInput
						style={styles.text}
						placeholder={'City (Eg. Macon)'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({city: text})}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>State</Text>
					<TextInput
						style={styles.text}
						placeholder={'State (Eg. Georgia)'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({state: text})}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Country</Text>
					<TextInput
						style={styles.text}
						placeholder={'Country (Eg. US)'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({country: text})}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Postal Code</Text>
					<TextInput
						style={styles.text}
						placeholder={'Postal Code (Eg. 31217)'}
						underlineColorAndroid="gray"
						autoCapitalize="none"
						onChangeText={(text) => this.setState({postalCode: text})}
						required
					/>
				</View>

				{/* <View
                    style={styles.checkboxContainer}
                >
                    <CheckBox
                        checked={this.state.update}
                        uncheckedColor="gray"
                        checkedColor='#02d9b5'
                        onPress={() => this.setState({update : !(this.state.update)})}
                    />
                    <Text >Update billing address</Text>
                </View> */}

				<TouchableOpacity
					style={styles.submitButton}
					onPress={() => {
						this.enterDetails();
					}}
				>
					<Text style={styles.submitButtonText}>Make Payment</Text>
				</TouchableOpacity>

				{/* To ensure that the scroll view doesnt stop scrolling mid way*/}
				<View style={styles.style1} />
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	style1: {
		height: 50,
	},

	container: {
		flex: 1,
		// alignItems: 'center',
		// justifyContent: 'center',
		// margin: "15%",
		backgroundColor: 'white',
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
		padding: 30,
		// backgroundColor: linear-gradient(#00ff99 29%, #00ffff 100%);
	},

	pageHeader: {
		flexDirection: 'row',
		paddingBottom: 25,
	},

	pageHeaderText: {
		fontSize: 20,
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
	},

	icon: {
		paddingRight: 7,
	},

	header: {
		color: '#02d9b5',
		fontSize: 18,
	},

	text: {
		color: '#5c5c5c',
		fontSize: 17,
	},

	field: {
		paddingBottom: 10,
	},

	submitButton: {
		backgroundColor: '#02f0c8',
		padding: 10,
		margin: 15,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
		fontFamily: 'Iowan Old Style',
	},

	submitButtonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 18,
		color: '#5c5c5c',
	},

	checkboxContainer: {
		padding: 5,
		margin: 5,
		height: 40,
		paddingRight: 50,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
		fontFamily: 'Iowan Old Style',
		flexDirection: 'row',
	},
});

export default PatientPayment;
