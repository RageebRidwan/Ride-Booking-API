import { Query } from "mongoose";

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  [key: string]: any;
}

class QueryBuilder<T> {
  public query: Query<T[], T>;
  public queryParams: QueryParams;

  constructor(query: Query<T[], T>, queryParams: QueryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  // Filter by exact match
  filter() {
    const queryObj = { ...this.queryParams };
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Handle range queries (e.g., fareMin, fareMax, dateFrom, dateTo)
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort results
  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // Default: newest first
    }
    return this;
  }

  // Select specific fields
  selectFields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryParams.page || "1", 10);
    const limit = parseInt(this.queryParams.limit || "10", 10);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Get pagination info
  async getPaginationInfo(totalQuery: Query<number, T>) {
    const page = parseInt(this.queryParams.page || "1", 10);
    const limit = parseInt(this.queryParams.limit || "10", 10);
    const total = await totalQuery.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages };
  }
}

export default QueryBuilder;
