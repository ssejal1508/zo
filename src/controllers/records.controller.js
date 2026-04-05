const recordsService = require("../services/records.service");
const { createRecordSchema, updateRecordSchema, listRecordsQuerySchema } = require("../validators/record.validator");
const { success } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

async function listRecords(req, res, next) {
  try {
    const parseResult = listRecordsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new ValidationError("Invalid query parameters", parseResult.error.format());
    }

    const { records, meta } = await recordsService.listRecords(parseResult.data, req.user);
    return success(res, { data: records, meta });
  } catch (error) {
    next(error);
  }
}

async function getRecord(req, res, next) {
  try {
    const record = await recordsService.getRecordById(req.params.id, req.user);
    return success(res, { data: record });
  } catch (error) {
    next(error);
  }
}

async function createRecord(req, res, next) {
  try {
    const parseResult = createRecordSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid record data", parseResult.error.format());
    }

    const record = await recordsService.createRecord(parseResult.data, req.user);
    return success(res, { status: 201, message: "Record created successfully", data: record });
  } catch (error) {
    next(error);
  }
}

async function updateRecord(req, res, next) {
  try {
    const parseResult = updateRecordSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid update data", parseResult.error.format());
    }

    const record = await recordsService.updateRecord(req.params.id, parseResult.data, req.user);
    return success(res, { message: "Record updated successfully", data: record });
  } catch (error) {
    next(error);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const result = await recordsService.deleteRecord(req.params.id);
    return success(res, { message: "Record deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };
