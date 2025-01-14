// base imports
import React from 'react';
import './Plant.css';
import ReactPlayer from 'react-player'
/*
import coin1 from '../assets/1_video.mp4';
import coin10 from '../assets/10_video.mp4';
import coin100 from '../assets/100_video.mp4';
import coin1000 from '../assets/1000_video.mp4';
*/
import Dropdown from 'react-dropdown';
import dai from '../assets/dai_logo.png';
import usdc from '../assets/usdc_logo.png';
import usdt from '../assets/usdt_logo.png';

// import Web3 from 'web3';

class Plant extends React.Component {
	constructor (props) {
		super(props);
		
		this.state = {
			level: 1,
			coinIndex: 0,
			totalCost: 10,
			coinMenuOpen: false,
			isApproved: false,
			test: 0, 
			hasBalance: false
		}; 

		this.coins = [
			'DAI',
			'USDC',
			'USDT'
		];

		this.options = [
			{ value: 'DAI', label: <div className = 'currencyOption'><div className = 'currencyLogo'><img src={dai} height="20px" width="20px" alt = {'Could not load'}/></div><p className = 'currencyText'>DAI</p></div> },
			{ value: 'USDC', label: <div className = 'currencyOption'><div className = 'currencyLogo'><img src={usdc} height="20px" width="20px" alt = {'Could not load'}/></div><p className = 'currencyText'>USDC</p></div> },
			// { value: 'USDT', label: <div className = 'currencyOption'><div className = 'currencyLogo'><img src={usdt} height="20px" width="20px" alt = {'Could not load'}/></div><p className = 'currencyText'>USDT</p></div> }
		];
		this.defaultOption = this.options[0];
	}

	componentDidMount = async() => {
		this.addEventListeners();
		this.checkApproval();
	}

	addEventListeners = async () => {

		if(this.props.isConnected) {
			this.props.DAIContract.events.allEvents()
			.on('data', (event) => {
				this.checkApproval();
			})
			.on('error', console.error);

			this.props.USDCContract.events.allEvents()
			.on('data', (event) => {
				this.checkApproval();
			})
			.on('error', console.error);

			this.props.USDTContract.events.allEvents()
			.on('data', (event) => {
				this.checkApproval();
			})
			.on('error', console.error);

			
			this.props.NFTreeContract.events.Transfer()
			.on('data', (event) => {
				let numCredits = this.state.totalCost / 10;
				this.props.insertDB(event.transactionHash, numCredits, this.state.totalCost, this.coins[this.state.coinIndex]);
			})
			.on('error', console.error);
		}
		
	}

	displayButton = () => {
		if(this.props.isConnected){
			if(this.state.hasBalance) {
				if (this.state.isApproved){
					return(
						<button className = 'plantButton' onClick = {this.mintNFTree}>
							<p> Plant </p> 
						</button>
					)
				} else  {
					return(
						<button className = 'plantButton' onClick = {this.approve}>
							<p> Approve {this.coins[this.state.coinIndex]} </p> 
						</button>
					)
				}
			} else {
				return(
					<button className = 'plantButton' style = {{backgroundColor: 'whitesmoke', color: '#6d6b6b'}}>
						<p> Insufficient Balance </p> 
					</button>
				)
			}
		} else {
			return(
				<button className = 'plantButton' >
					<p> Plant </p> 
				</button>
			)
		}
	}

	displayNFTree = () => {
		if(this.state.level === 1){
			return(
				<ReactPlayer
					className='video-player'
					url= 'videos/1_video.mp4'
					width='100%'
					height='100%'
					controls = {false}
					playing = {true}
					loop = {true}
					muted = {true}
				/>
			)
		} 
		else if(this.state.level === 2){
			return(
				<ReactPlayer
					className='video-player'
					url= 'videos/10_video.mp4'
					width='100%'
					height='100%'
					controls = {false}
					playing = {true}
					loop = {true}
					muted = {true}
				/>
			)
		}
		else if(this.state.level === 3){
			return(
				<ReactPlayer
					className='video-player'
					url= 'videos/100_video.mp4'
					width='100%'
					height='100%'
					controls = {false}
					playing = {true}
					loop = {true}
					muted = {true}
				/>
			)
		}
		else{
			return(
				<ReactPlayer
					className='video-player'
					url= 'videos/1000_video.mp4'
					width='100%'
					height='100%'
					controls = {false}
					playing = {true}
					loop = {true}
					muted = {true}
				/>
			)
		}
	}

	displayLevel = () => {
		if(this.state.level === 1){
			return('1 NFTree');
		}
		else if (this.state.level === 2){
			return('10 NFTrees');
		}
		else if (this.state.level === 3){
			return('100 NFTrees');
		}
		else{
			return('1,000 NFTrees');
		}
	}

	displayLevelDescription = () => {
		if(this.state.level === 1){
			return('1 tonne CO₂ offset → 6 trees planted');
		}
		else if (this.state.level === 2){
			return('10 tonnes CO₂ offset → 60 trees planted');
		}
		else if (this.state.level === 3){
			return('100 tonnes CO₂ offset → 600 trees planted');
		}
		else{
			return('1,000 tonnes CO₂ offset → 6,000 trees planted');
		}
	}

	displayTotal = () => {
		var coin;
		if (this.state.coinIndex === 0){
				coin = 'DAI';
		}
		else if (this.state.coinIndex === 1) {
				coin = 'USDC';
		}
		else if (this.state.coinIndex === 2) {
				coin = 'USDT';
		}
		return(
				'$' + String(this.state.totalCost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + coin
		)
	}

	incLevel = async() => {

		if(this.state.level < 4){
			this.setState({
				level: this.state.level + 1,
				totalCost: this.state.totalCost * 10,
			});
		}

		await this.checkApproval();
	}

	decLevel = async() => {
		if(this.state.level > 1){
			this.setState({
				level: this.state.level - 1,
				totalCost: this.state.totalCost / 10,
			}); 
		}

		await this.checkApproval();
	}

	checkApproval = async () => {
		let allowance = await this.props.getAllowance(this.coins[this.state.coinIndex]);
		let hasBalance = await this.props.hasBalance(this.coins[this.state.coinIndex], this.state.totalCost);
		if(allowance < this.state.totalCost * (10**this.props.decimals[this.coins[this.state.coinIndex]])){
			this.setState({
				isApproved: false,
				hasBalance: hasBalance
			});
		}
		else {
			this.setState({
				isApproved: true,
				hasBalance: hasBalance
			});
		}
	}

	approve = async () => {
		if(this.props.isConnected){
			this.props.approve(10000, this.coins[this.state.coinIndex]);
		} else {
			alert("connect metamask!");
		}
	}

	mintNFTree = async () => {
		let numCredits = this.state.totalCost / 10;
		if(this.props.isConnected){
			this.props.mintNFTree(numCredits, this.state.totalCost, this.coins[this.state.coinIndex]);
		} else {
			alert("connect metamask!");
		}
	}

	changeCurrency = async(event) => {
		var currency = event.value;
		if (currency === 'DAI'){
			await this.setState({
				coinIndex: 0
			}); 
		}
		else if (currency === 'USDC') {
			await this.setState({
				coinIndex: 1
			}); 
		}
		else if (currency === 'USDT') {
			await this.setState({
				coinIndex: 2
			}); 
		}
		this.checkApproval();
	}

	render() {
		return (
			<div className = "Plant">
				<div className = 'plantContainer'>
					<div className = 'plantGrid'>
						<div className = 'plantLeft'>
							<div className = 'plantTitle'>Plant</div>
								<div className = 'levelSelector'>
									<div className = 'selector'> 
											<button className = 'selectorButton' onClick = {this.decLevel}> − </button>
											<button className = 'selectorButton' onClick = {this.incLevel}> + </button>
									</div>

									<div className = 'level'> 
										<p className = 'levelText'> {this.displayLevel()} </p>
									</div>
								</div>

								<div className = 'levelDescription'>
									<p className = 'description'>{this.displayLevelDescription()}</p>
								</div>

								<div className = 'currencySelector'>
									<div className = 'currency'> 
										<Dropdown className = 'currencyDropdown' options={this.options} onChange={this.changeCurrency} value={this.options[this.state.coinIndex]} placeholder="Select currency"/>
									</div>

									<div className = 'total'> 
										<p className = 'totalText'> {this.displayTotal()} </p>
									</div>
								</div>

								{this.displayButton()}
							</div>

						<div className = 'plantRight'>{this.displayNFTree()}</div>
					</div>
					<div className = "plantSpacer"/> 
				</div>
			</div>
		);
	}   
}

export default Plant;
