from enum import Enum

class JobSource(str, Enum):
    JOBSPY = "jobspy"
    ARBEITNOW = "arbeitnow"
    HIMALAYAS = "himalayas"
    FREEHIRE = "freehire"
    JSEARCH = "jsearch"
    UNKNOWN = "unknown"

class WorkType(str, Enum):
    REMOTE = "remote"
    ONSITE = "onsite"
    HYBRID = "hybrid"
    ANY = "any"

class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    ALL = "all"
