package services.utils

import kotlin.collections.HashMap


class GameQueryDTO {
    var data = GameData()
}

class GameData {
    var viewer = GameViewer()
}

class GameViewer {
    var gameDetailsByIds: List<Details> = listOf()
}

class Details {
    constructor()
    constructor(map: HashMap<*,*>) {
        homePointsTotal = NestedMapUtil.extractInt(map, listOf("homePointsTotal"))!!
        homeTeam = GameTeam(NestedMapUtil.extractString(map, listOf("homeTeam", "abbreviation"))!!)
        visitorPointsTotal = NestedMapUtil.extractInt(map, listOf("visitorPointsTotal"))!!
        visitorTeam = GameTeam(NestedMapUtil.extractString(map, listOf("visitorTeam", "abbreviation"))!!)
        phase = NestedMapUtil.extractString(map, listOf("phase"))!!
    }

    var phase: String = ""
    var homePointsTotal: Int = 0
    var visitorPointsTotal: Int = 0
    var visitorTeam = GameTeam()
    var homeTeam = GameTeam()

    fun getOutcome(): String? {
        var result = "TIE"


        if (!phase.contains("FINAL")) {
            return null
        }

        if (homePointsTotal > visitorPointsTotal) {
            result = homeTeam.abbreviation
        }
        if (homePointsTotal < visitorPointsTotal) {
            result = visitorTeam.abbreviation
        }
        return result
    }
}

class GameTeam(var abbreviation: String = "")