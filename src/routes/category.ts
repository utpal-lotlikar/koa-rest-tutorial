import { getRepository } from 'typeorm';
import { Category } from 'entity/Category';
const RestResponse = require('../helpers/restResponse');
const Joi = require('@hapi/joi');

module.exports = ({ categoryRouter }) => {
    // GET all categories
    categoryRouter.get('/', async (ctx, next) => {
        var result = new RestResponse();
        const repository = getRepository(Category);
        let allCategories 
        if (ctx.query.enabled !== undefined) {
            const res = new Buffer(1);
            if (ctx.query.enabled === 'true'){
                res[0] = 1
            } else {
                res[0] = 0
            }
            allCategories = await repository.find({ where: { enabled: res[0],
                tenantId: ctx.state.jwtdata.user_tenant} });
        } else {
            allCategories = await repository.find({ where: { tenantId: ctx.state.jwtdata.user_tenant} });
        }
        result.setData(allCategories);
        ctx.body = result;
    });

    // GET category
    categoryRouter.get('/:id', async (ctx, next) => {
        let result = new RestResponse();
        const repository = getRepository(Category);
        let category = await repository.findOne({ where: { id: ctx.params.id, 
            tenantId: ctx.state.jwtdata.user_tenant} });
        if (!category) {
            ctx.response.status = 404;
            result.setError(404, "No record found");
        } else {
            result.setData(category);
        }
        
        ctx.body = result;
    });

    // Create brand
    categoryRouter.post('/', async (ctx, next) => {
        let result = new RestResponse();
        
        let category = new Category();
        category.name = ctx.request.body.name;
        category.enabled = ctx.request.body.enabled;
        category.tenantId = ctx.state.jwtdata.user_tenant

        const schema = Joi.object().keys({
            name: Joi.string().alphanum().min(1).max(30).required(),
            enabled: Joi.boolean(),
            tenantId: Joi.number().integer().required()
        });
        
        const validity = Joi.validate(category, schema);

        if (!validity.error) {
            const repository = getRepository(Category);

            let existing = await repository.findOne({ where: { name: category.name, 
                tenantId: ctx.state.jwtdata.user_tenant} });

            console.log(JSON.stringify(existing));

            if (!existing) {
                await repository.save(category)
                result.setData(category);    
                ctx.body = result;
            } else {
                ctx.response.status = 402;
                result.setError(402, "Category with the name already exists");
                ctx.body = result;
            }
        } else {
            ctx.response.status = 401;
            result.setData(validity.error.details)
            result.setError(401, "Validation Error");
            ctx.body = result;
        }
        
    });

    // Update brand
    categoryRouter.put('/:id', async (ctx, next) => {
        let result = new RestResponse();

        const repository = getRepository(Category);
        let category = await repository.findOne({ where: { id: ctx.params.id, 
            tenantId: ctx.state.jwtdata.user_tenant} });
        if (category) {
            category.name = ctx.request.body.name;
            category.enabled = ctx.request.body.enabled;

            const schema = Joi.object().keys({
                name: Joi.string().alphanum().min(1).max(30).required(),
                enabled: Joi.boolean(),
                tenantId: Joi.number().integer().required(),
                version: Joi.number().integer(),
                dateCreated: Joi.date(),
                lastUpdated: Joi.date(),
                id: Joi.number()
            });
            
            const validity = Joi.validate(category, schema);

            if (!validity.error) {
                const repository = getRepository(Category);
                await repository.save(category)
                result.setData(category);    
                ctx.body = result;
            } else {
                ctx.response.status = 401;
                result.setData(validity.error.details)
                result.setError(401, "Validation Error");
                ctx.body = result;
            }
        } else {
            ctx.response.status = 404;
            result.setError(404, "No record found");
        }
        ctx.body = result;
    });

};