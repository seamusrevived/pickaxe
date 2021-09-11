package services.nflapi

import services.utils.NestedMapUtil
import java.time.OffsetDateTime

class GameResponse(map: HashMap<*, *>) {
    var details: Details?
    var time: OffsetDateTime? = null
    var awayTeam: GameTeam
    var homeTeam: GameTeam

    init {
        details = NestedMapUtil.extractDetails(map, "detail")
        time = NestedMapUtil.extractOffsetDateTime(map, "time")
        awayTeam = GameTeam(NestedMapUtil.extractString(map, listOf("awayTeam", "abbreviation")) ?: "")
        homeTeam = GameTeam(NestedMapUtil.extractString(map, listOf("homeTeam", "abbreviation")) ?: "")
    }
}

