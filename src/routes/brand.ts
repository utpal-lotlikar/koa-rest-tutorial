import { getRepository } from 'typeorm';
import { Brand } from 'entity/Brand';
const RestResponse = require('../helpers/restResponse');
const Joi = require('@hapi/joi');

module.exports = ({ brandRouter }) => {
    // GET all brands
    brandRouter.get('/', async (ctx, next) => {
        var result = new RestResponse();
        const repository = getRepository(Brand);
        let allBrands
        if (ctx.query.enabled !== undefined) {
            const res = new Buffer(1);
            if (ctx.query.enabled === 'true'){
                res[0] = 1
            } else {
                res[0] = 0
            }
            allBrands = await repository.find({ where: { enabled: res[0],
                tenantId: ctx.state.jwtdata.user_tenant} });
        } else {
            allBrands = await repository.find({ where: { tenantId: ctx.state.jwtdata.user_tenant} });
        }
        result.setData(allBrands);
        ctx.body = result;
    });

    // GET all brands
    brandRouter.get('/:id', async (ctx, next) => {
        let result = new RestResponse();
        const repository = getRepository(Brand);
        let brand = await repository.findOne({ where: { id: ctx.params.id, 
            tenantId: ctx.state.jwtdata.user_tenant} });
        if (!brand) {
            ctx.response.status = 404;
            result.setError(404, "No record found");
        } else {
            result.setData(brand);
        }
        
        ctx.body = result;
    });

    // Create brand
    brandRouter.post('/', async (ctx, next) => {
        let result = new RestResponse();
        
        let brand = new Brand();
        brand.name = ctx.request.body.name;
        brand.enabled = ctx.request.body.enabled;
        brand.tenantId = ctx.state.jwtdata.user_tenant

        const schema = Joi.object().keys({
            name: Joi.string().alphanum().min(1).max(30).required(),
            enabled: Joi.boolean(),
            tenantId: Joi.number().integer().required()
        });
        
        const validity = Joi.validate(brand, schema);

        if (!validity.error) {
            const repository = getRepository(Brand);

            let existing = await repository.findOne({ where: { name: brand.name, 
                tenantId: ctx.state.jwtdata.user_tenant} });

            console.log(JSON.stringify(existing));

            if (!existing) {
                await repository.save(brand)
                result.setData(brand);    
                ctx.body = result;
            } else {
                ctx.response.status = 402;
                result.setError(402, "Brand with the name already exists");
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
    brandRouter.put('/:id', async (ctx, next) => {
        let result = new RestResponse();

        const repository = getRepository(Brand);
        let brand = await repository.findOne({ where: { id: ctx.params.id, 
            tenantId: ctx.state.jwtdata.user_tenant} });
        if (brand) {
            brand.name = ctx.request.body.name;
            brand.enabled = ctx.request.body.enabled;

            const schema = Joi.object().keys({
                name: Joi.string().alphanum().min(1).max(30).required(),
                enabled: Joi.boolean(),
                tenantId: Joi.number().integer().required(),
                version: Joi.number().integer(),
                dateCreated: Joi.date(),
                lastUpdated: Joi.date(),
                id: Joi.number()
            });
            
            const validity = Joi.validate(brand, schema);

            if (!validity.error) {
                const repository = getRepository(Brand);
                await repository.save(brand)
                result.setData(brand);    
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