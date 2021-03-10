describe('Patient SignIn flow test', () => {
	beforeEach(async () => {
		//await device.reloadReactNative();
	});

	it('should have startup screen', async () => {
		await expect(element(by.id('startup'))).toBeVisible();
	});

	it('should show "Sign Up"', async () => {
		await expect(element(by.id('signup'))).toBeVisible();
	});

	it('should show "Sign In"', async () => {
		await expect(element(by.id('signin'))).toBeVisible();
	});

	it('should render "Patient Sign In Page" on pressing sign in', async () => {
		await device.reloadReactNative();
		await device.launchApp();
		await element(by.id('signin')).tap();
		await element(by.id('patientToggle')).tap();
		await expect(element(by.id('email'))).toBeVisible();
		await expect(element(by.id('password'))).toBeVisible();
		await expect(element(by.id('signin_button'))).toBeVisible();
	});

	it('should render “the invalid alert” on giving wrong info', async () => {
		await element(by.id('email')).typeText('john@example.com');
		await element(by.id('password')).typeText('examplepass');
		await element(by.id('signin_button')).tap();
		await expect(element(by.text('Alert'))).toBeVisible();
	});

	it('should go to “the homepage” on giving right info', async () => {
		await element(by.text('OK')).tap();
		await element(by.id('email')).clearText();
		await element(by.id('password')).clearText();
		await element(by.id('email')).typeText('p@gmail.com');
		await element(by.id('password')).typeText('12345678');
		await element(by.id('signin_button')).tap();
		await expect(element(by.id('homepage'))).toBeVisible();
	});
});
