package services.nflapi

import services.utils.NestedMapUtil
import java.util.*

class Details(map: Map<*, *>) {
    var id: UUID? = null
    var phase: String = ""
    var homePointsTotal: Int = 0
    var visitorPointsTotal: Int = 0
    var visitorTeam = GameTeam()

    var homeTeam = GameTeam()


    init {
        homePointsTotal = NestedMapUtil.extractInt(map, "homePointsTotal") ?: 0
        homeTeam = GameTeam(NestedMapUtil.extractString(map, listOf("homeTeam", "abbreviation")) ?: "")
        visitorPointsTotal = NestedMapUtil.extractInt(map, "visitorPointsTotal") ?: 0
        visitorTeam = GameTeam(NestedMapUtil.extractString(map, listOf("visitorTeam", "abbreviation")) ?: "")
        phase = NestedMapUtil.extractString(map, "phase") ?: ""
        id = NestedMapUtil.extractUUID(map, "id")
    }

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