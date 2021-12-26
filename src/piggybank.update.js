const uuid = require('uuid')
const Joi = require('joi')

class Handler {
	constructor({ dynamoDbSvc }) {
		this.dynamoDbSvc = dynamoDbSvc
		this.dynamodbTable = process.env.PIGGY_BANKS_TABLE
	}

	static validator(){
		return Joi.object({
			nome: Joi.string().max(100).min(2).required(),
			poder: Joi.string().max(20).required()
		})
	}

	async updateItem(params) {
		return this.dynamoDbSvc.update(params).promise()
	}

	prepareData(data) {
		const params = {
			TableName: this.dynamodbTable,
			Key: {
				id: data.id
			},
			UpdateExpression: "set #n=:n, savedValue=:sv, goalValue=:gv, goalDate=:gd",
			ExpressionAttributeNames:  {'#n': 'name'},
			ExpressionAttributeValues:{
				":n":data.name,
				":sv":data.savedValue,
				":gv":data.goalValue,
				":gd":data.goalDate
			},
			ReturnValues:"UPDATED_NEW"
		}

		return params
	}

	handelrSuccess(data) {
		return {
			statusCode: 200,
			body: JSON.stringify(data),
		}
	}

	handleError(data) {
		return {
			statusCode: data.statusCode || 501,
			headers: { 'Content-Type': 'text/plain' },
			body: "Couldn't create the item!!",
		}
	}

	async main(event) {
		try {
			const data = JSON.parse(event.body)
			const {error, value} = await Handler.validator().validate(data)
			
			const dbParams = this.prepareData(data)
			const result = await this.updateItem(dbParams)
			return this.handelrSuccess(JSON.stringify(result))
		} catch (err) {
			console.log('Oh no!', err.stack)
			this.handleError({ statusCode: 500 })
		}
	}
}

const AWS = require('aws-sdk') //npm i aws-sdk
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
	dynamoDbSvc: dynamoDB,
})

module.exports = handler.main.bind(handler)
