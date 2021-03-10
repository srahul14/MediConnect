import React from 'react';
import {Component} from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {Dropdown} from 'react-native-material-dropdown';
import {LogBox} from 'react-native';

class DoctorEditAccount extends Component {
	state = {
		first_name: '',
		last_name: '',
		email: '',
		age: 0,
		specialization: '',
		years_of_experience: 0,
	};

	componentDidMount() {
		// this.setState({first_name: global.first_name});
		// this.setState({last_name: global.last_name});
		// this.setState({email: global.email});
		// this.setState({age: global.age});
		// this.setState({specialization: global.specialization});
		// this.setState({years_of_experience: global.years_of_experience});

		this.state.first_name = global.first_name;
		this.state.last_name = global.last_name;
		this.state.email = global.email;
		this.state.age = global.age;
		this.state.specialization = global.specialization;
		this.state.years_of_experience = global.years_of_experience;

		console.log(global.age);

		// this.state.first_name = global.first_name,
		// this.state.last_name = global.last_name,
		// this.state.email = global.email,
		// this.state.age = global.age,
		// this.state.specialization = global.specialization,
		// this.state.years_of_experience = global.years_of_experience
	}

	changeFirstName = (text) => {
		// console.log(this.state.first_name);
		this.setState({first_name: text});
		// console.log(global.first_name);
		// console.log(this.state.first_name);
	};

	changeLastName = (text) => {
		this.setState({last_name: text});
	};

	changeEmail = (text) => {
		this.setState({email: text});
	};

	changeAge = (text) => {
		this.setState({age: parseInt(text, 10)});
		console.log(this.state.age);
	};

	changeSpecialization = (text) => {
		this.setState({specialization: text});
	};

	changeYOE = (text) => {
		this.setState({years_of_experience: parseInt(text, 10)});
	};

	async saveEdits() {
		axios
			.put('http://54.176.99.202:5000/doctor/' + global.userID, {
				// .put('http://10.0.2.2:5000/doctor/' + global.userID, {
				// params: {
				first_name: this.state.first_name,
				last_name: this.state.last_name,
				email: this.state.email,
				age: this.state.age,
				specialization: this.state.specialization,
				years_of_experience: this.state.years_of_experience,
				// },
			})
			.then((res) => {
				// console.log(symptom);
				global.first_name = this.state.first_name;
				global.last_name = this.state.last_name;
				global.email = this.state.email;
				global.age = this.state.age;
				global.specialization = this.state.specialization;
				global.years_of_experience = this.state.years_of_experience;
				// console.log(global.age);
				console.log(res);
				// alert('Your account details were successfully updated');
				// this.props.navigation.navigate('DoctorHomeNavigator');
			})
			.catch((err) => {
				console.log(err.response.data);
			});
		console.log(this.state.first_name);
	}

	render() {
		let data = [
			{
				value: 'Allergy and Immunology',
			},
			{
				value: 'Anesthesiology',
			},
			{
				value: 'Colon and Rectal Surgery',
			},
			{
				value: 'Dermatology',
			},
			{
				value: 'Emergency Medicine',
			},
			{
				value: 'Family Medicine',
			},
			{
				value: 'Internal Medicine',
			},
			{
				value: 'Medical Genetics and Genomics',
			},
			{
				value: 'Neurological Surgery',
			},
			{
				value: 'Nuclear Medicine',
			},
			{
				value: 'Obstetrics and Gynecology',
			},
			{
				value: 'Opthalmology',
			},
			{
				value: 'Orthopaedic Surgery',
			},
			{
				value: 'Otolaryngology',
			},
			{
				value: 'Pathology',
			},
			{
				value: 'Pediatrics',
			},
			{
				value: 'Physical Medicine and Rehabilitation',
			},
			{
				value: 'Plastic Surgery',
			},
			{
				value: 'Preventative Medicine',
			},
			{
				value: 'Psychiatry and Neurology',
			},
			{
				value: 'Radiology',
			},
			{
				value: 'Surgery',
			},
			{
				value: 'Thoracic Surgery',
			},
			{
				value: 'Urology',
			},
		];
		return (
			<View style={styles.container}>
				<View style={styles.accountHeader}>
					<Icon style={styles.icon} name="user" size={30} color={'#5c5c5c'} />
					<Text style={styles.accountHeaderText}>Edit Account Details</Text>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>First Name</Text>
					<TextInput
						testID="firstname"
						style={styles.text}
						underlineColorAndroid="gray"
						defaultValue={global.first_name}
						autoCapitalize="none"
						onChangeText={this.changeFirstName}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Last Name</Text>
					<TextInput
						testID="lastname"
						style={styles.text}
						underlineColorAndroid="gray"
						defaultValue={global.last_name}
						autoCapitalize="none"
						onChangeText={this.changeLastName}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Email</Text>
					<TextInput
						testID="email"
						style={styles.text}
						underlineColorAndroid="gray"
						defaultValue={global.email}
						autoCapitalize="none"
						onChangeText={this.changeEmail}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Age</Text>
					<TextInput
						testID="age"
						style={styles.text}
						underlineColorAndroid="gray"
						defaultValue={global.age === 0 ? '-' : global.age.toString()}
						autoCapitalize="none"
						onChangeText={this.changeAge}
						required
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Specialization</Text>
					<Dropdown
						label={global.specialization}
						data={data}
						useNativeDriver={true}
						onChangeText={(value) => {
							LogBox.ignoreLogs([
								'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
							]);
							this.setState({
								specialization: value,
							});
						}}
					/>
					{/*<TextInput
                        style={styles.text}
                        underlineColorAndroid="gray"
                        defaultValue={global.specialization}
                        autoCapitalize="none"
                        onChangeText={this.changeSpecialization}
                        required
                   />*/}
				</View>

				<View style={styles.field}>
					<Text style={styles.header}>Years of Experience</Text>
					<TextInput
						testID="experience"
						style={styles.text}
						underlineColorAndroid="gray"
						defaultValue={global.years_of_experience.toString()}
						autoCapitalize="none"
						onChangeText={this.changeYOE}
						required
					/>
				</View>

				<TouchableOpacity style={styles.button} testID="Save_Button">
					<Text
						style={styles.buttonText}
						onPress={() => {
							this.saveEdits();
						}}
					>
						Save
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
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

	header: {
		color: '#02f0c8',
		fontSize: 18,
	},

	text: {
		color: '#5c5c5c',
		fontSize: 17,
	},

	field: {
		paddingBottom: 10,
	},

	accountHeader: {
		flexDirection: 'row',
		paddingBottom: 25,
	},

	accountHeaderText: {
		fontSize: 20,
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
	},

	icon: {
		paddingRight: 7,
	},

	button: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	buttonText: {
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: 'Iowan Old Style',
		fontSize: 20,
		color: 'white',
		backgroundColor: '#02f0c8',
		paddingTop: 5,
		paddingBottom: 5,
		paddingRight: 20,
		paddingLeft: 20,
		// padding: 10,
		margin: 10,
		borderRadius: 7,
		// width: 100,
	},
});

export default DoctorEditAccount;
