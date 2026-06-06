import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CardSkeleton from "@/components/CardSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import SettingsButton from "@/components/SettingsButton";
import SignInScreen from "@/components/SignInScreen";
import WeatherIcon from "@/components/WeatherIcon";
import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { fetchBrief, fetchCalendarEvents, fetchWeather } from "@/lib/api";
import { capitalize, formatEventTime, getDeviceTimezone } from "@/lib/datetime";
import { getHomeLocation } from "@/lib/settings";
import type { CalendarEventWithWeather, Tab, WeatherData } from "@/lib/types";

export default function HomeScreen() {
  const { status } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const [timezone] = useState(getDeviceTimezone);
  const [heroWeather, setHeroWeather] = useState<WeatherData | null>(null);
  const [heroLocationLabel, setHeroLocationLabel] = useState<string | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEventWithWeather[]>([]);
  const [brief, setBrief] = useState<string | null>(null);

  const [loadingHero, setLoadingHero] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const [heroError, setHeroError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  const resolveHeroWeather = useCallback(
    async (calendarEvents: CalendarEventWithWeather[], day: Tab) => {
      setLoadingHero(true);
      setHeroError(null);

      const firstEventWithWeather = calendarEvents.find(
        (event) => event.weather
      );
      if (firstEventWithWeather?.weather) {
        setHeroWeather(firstEventWithWeather.weather);
        setHeroLocationLabel(
          firstEventWithWeather.displayName ?? firstEventWithWeather.location
        );
        setLoadingHero(false);
        return;
      }

      const homeLocation = await getHomeLocation();
      if (!homeLocation) {
        setHeroWeather(null);
        setHeroLocationLabel(null);
        setHeroError(
          `No events ${day === "today" ? "today" : "tomorrow"}. Set a home address in settings to see weather.`
        );
        setLoadingHero(false);
        return;
      }

      const result = await fetchWeather(homeLocation, day);
      if (result.error) {
        setHeroWeather(null);
        setHeroLocationLabel(null);
        setHeroError(result.error);
      } else {
        setHeroWeather(result.weather);
        setHeroLocationLabel(result.displayName ?? homeLocation);
      }
      setLoadingHero(false);
    },
    []
  );

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    setLoadingHero(true);
    setEventsError(null);

    const result = await fetchCalendarEvents(timezone, tab);
    if (result.error) {
      setEvents([]);
      setEventsError(result.error);
      await resolveHeroWeather([], tab);
    } else {
      setEvents(result.events);
      await resolveHeroWeather(result.events, tab);
    }

    setLoadingEvents(false);
  }, [timezone, tab, resolveHeroWeather]);

  const fetchBriefData = useCallback(async () => {
    if (tab !== "today") {
      setBrief(null);
      setBriefError(null);
      setLoadingBrief(false);
      return;
    }

    setLoadingBrief(true);
    setBriefError(null);

    const result = await fetchBrief(timezone);
    if (result.error) {
      setBrief(null);
      setBriefError(result.error);
    } else {
      setBrief(result.brief);
    }

    setLoadingBrief(false);
  }, [timezone, tab]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void fetchEvents();
    void fetchBriefData();
  }, [status, fetchEvents, fetchBriefData]);

  if (status === "unauthenticated") {
    return <SignInScreen />;
  }

  const isSessionLoading = status === "loading";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Don&apos;t Forget</Text>
              {isSessionLoading && (
                <Text style={styles.subtitle}>Checking sign-in...</Text>
              )}
            </View>
            <SettingsButton />
          </View>

          <View style={styles.tabBar}>
            {(["today", "tomorrow"] as Tab[]).map((value) => (
              <Pressable
                key={value}
                style={[
                  styles.tabButton,
                  tab === value && styles.tabButtonActive,
                ]}
                onPress={() => setTab(value)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    tab === value && styles.tabButtonTextActive,
                  ]}
                >
                  {value === "today" ? "Today" : "Tomorrow"}
                </Text>
              </Pressable>
            ))}
          </View>

          {isSessionLoading || loadingHero ? (
            <CardSkeleton height={144} style={styles.heroSkeleton} />
          ) : (
            <View style={styles.heroCard}>
              {heroError ? (
                <ErrorMessage message={heroError} />
              ) : (
                <View style={styles.heroContent}>
                  <View style={styles.heroText}>
                    <Text style={styles.heroLocation}>
                      {heroLocationLabel ?? "Weather"}
                    </Text>
                    <Text style={styles.heroTemp}>
                      {heroWeather ? `${heroWeather.temperatureF}°` : "—"}
                    </Text>
                    <Text style={styles.heroCondition}>
                      {heroWeather
                        ? capitalize(heroWeather.condition)
                        : "Weather unavailable"}
                    </Text>
                  </View>
                  {heroWeather && (
                    <WeatherIcon
                      condition={heroWeather.condition}
                      style={styles.heroIcon}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          {tab === "today" &&
            (isSessionLoading || loadingBrief ? (
              <CardSkeleton height={112} style={styles.briefSkeleton} />
            ) : (
              <View style={styles.briefCard}>
                <Text style={styles.sectionTitle}>Morning Brief</Text>
                {briefError ? (
                  <ErrorMessage message={briefError} />
                ) : (
                  <Text style={styles.briefText}>
                    {brief ?? "No brief available for today."}
                  </Text>
                )}
              </View>
            ))}

          <Text style={styles.eventsSectionTitle}>
            {tab === "today" ? "Your Day" : "Tomorrow"}
          </Text>

          {isSessionLoading || loadingEvents ? (
            <View style={styles.skeletonList}>
              <CardSkeleton height={96} />
              <CardSkeleton height={96} />
              <CardSkeleton height={96} />
            </View>
          ) : eventsError ? (
            <ErrorMessage message={eventsError} />
          ) : events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No events with locations scheduled for{" "}
                {tab === "today" ? "today" : "tomorrow"}.
              </Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {events.map((event) => (
                <View
                  key={`${event.title}-${event.startTime}`}
                  style={styles.eventCard}
                >
                  <View style={styles.eventRow}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTime}>
                        {formatEventTime(event.startTime, timezone)}
                      </Text>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {event.displayName ?? event.location}
                      </Text>
                    </View>
                    {event.weather && (
                      <View style={styles.eventWeather}>
                        <WeatherIcon
                          condition={event.weather.condition}
                          style={styles.eventWeatherIcon}
                        />
                        <Text style={styles.eventTemp}>
                          {event.weather.temperatureF}°
                        </Text>
                        <Text style={styles.eventCondition}>
                          {capitalize(event.weather.condition)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {event.weather && event.weather.chanceOfRain > 30 && (
                    <View style={styles.rainBadge}>
                      <Text style={styles.rainBadgeText}>
                        🌧 {event.weather.chanceOfRain}% chance of rain
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.slate900,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.slate400,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.slate500,
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  heroSkeleton: {
    marginBottom: 16,
  },
  heroCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.heroGradientStart,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroText: {
    flex: 1,
  },
  heroLocation: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.slate500,
  },
  heroTemp: {
    marginTop: 4,
    fontSize: 48,
    fontWeight: "600",
    color: colors.slate900,
  },
  heroCondition: {
    marginTop: 4,
    fontSize: 16,
    color: colors.slate600,
  },
  heroIcon: {
    fontSize: 48,
  },
  briefSkeleton: {
    marginBottom: 24,
  },
  briefCard: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate900,
  },
  briefText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.slate600,
  },
  eventsSectionTitle: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate900,
  },
  skeletonList: {
    gap: 12,
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: "center",
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },
  eventTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: colors.slate900,
  },
  eventLocation: {
    marginTop: 4,
    fontSize: 14,
    color: colors.slate500,
  },
  eventWeather: {
    alignItems: "flex-end",
    gap: 4,
  },
  eventWeatherIcon: {
    fontSize: 24,
  },
  eventTemp: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.slate700,
  },
  eventCondition: {
    fontSize: 12,
    color: colors.slate400,
  },
  rainBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rainBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primaryDarker,
  },
});
