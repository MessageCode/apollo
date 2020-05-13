package io.logz.apollo.websockets.exec;

import io.logz.apollo.auth.PermissionsValidator;
import io.logz.apollo.auth.TokenConverter;
import io.logz.apollo.common.HttpStatus;
import io.logz.apollo.common.StringParser;
import io.logz.apollo.services.AuthenticationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Optional;
import java.util.stream.Stream;

import static java.util.Objects.requireNonNull;

/**
 * Created by roiravhon on 5/23/17.
 */
@Singleton
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final AuthenticationService authenticationService;

    @Inject
    public AuthenticationFilter(AuthenticationService authenticationService) {
        this.authenticationService = requireNonNull(authenticationService);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) {

        Optional<String> token = Stream.of(((HttpServletRequest) servletRequest).getCookies())
                .filter(cookie -> cookie.getName().equals("_token"))
                .findFirst()
                .map(Cookie::getValue);

        if (!token.isPresent()) {
            ((HttpServletResponse) servletResponse).setStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        try {
            String userName = TokenConverter.convertTokenToUser(token.get());
            int environmentId = StringParser.getIntFromQueryString(((HttpServletRequest) servletRequest).getQueryString(), ContainerExecEndpoint.QUERY_STRING_ENVIRONMENT_KEY);
            int serviceId = StringParser.getIntFromQueryString(((HttpServletRequest) servletRequest).getQueryString(), ContainerExecEndpoint.QUERY_STRING_SERVICE_KEY);

            if (PermissionsValidator.isAllowedToExec(serviceId, environmentId, authenticationService.getPermissionsByUser(userName), authenticationService.getUser(userName).isAdmin(), authenticationService.getUser(userName).isExecAllowed())) {
                MDC.put("serviceId", String.valueOf(serviceId));
                MDC.put("environmentId", String.valueOf(environmentId));
                MDC.put("userName", userName);
                logger.info("Granted Live-Session permission to user {} on service {} and environment {}", userName, serviceId, environmentId);
                filterChain.doFilter(servletRequest, servletResponse);
            } else {
                logger.info("User {} have no permissions to exec to service {} on environment {}", userName, serviceId, environmentId);
                ((HttpServletResponse) servletResponse).setStatus(HttpStatus.FORBIDDEN);
            }
        } catch (Exception e) {
            logger.warn("Got exception while validating user permissions for deployment, assuming no!", e);
            ((HttpServletResponse) servletResponse).setStatus(HttpStatus.FORBIDDEN);
        }
    }

    @Override
    public void destroy() {}

}
