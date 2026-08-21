class JobAggregatorException(Exception):
    """Base exception for Job Aggregator application"""
    pass

class ResumeParsingError(JobAggregatorException):
    """Raised when resume content extraction or parsing fails"""
    pass

class IntegrationError(JobAggregatorException):
    """Raised when job board API integration fails"""
    pass

class DatabaseError(JobAggregatorException):
    """Raised when database operations fail"""
    pass
