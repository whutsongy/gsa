/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for GSA's OMP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/**
 * @file gsad_omp.h
 * @brief Headers for GSA's OMP communication module.
 */

#ifndef _GSAD_OMP_H
#define _GSAD_OMP_H

#include <glib.h> /* for gboolean */

#include "gsad_base.h" /* for credentials_t */

void omp_init (const gchar *, int);

char * create_report_omp (credentials_t *, params_t *);
char * create_task_omp (credentials_t *, params_t *);
char * delete_task_omp (credentials_t *, params_t *);
char * delete_trash_task_omp (credentials_t *, params_t *);
char * edit_task_omp (credentials_t *, const char *, const char *, const char *,
                      const char *, const char *, int);
char * new_task_omp (credentials_t *, const char *, int);
char * save_task_omp (credentials_t *, const char *, const char *, const char *,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *, const char *, int,
                      const char *, const char *);
char * save_container_task_omp (credentials_t *, const char *, const char *,
                                const char *, const char *, const char *,
                                const char *, const char *, int);
char * pause_task_omp (credentials_t *, const char *, int, const char *);
char * resume_paused_task_omp (credentials_t *, const char *, int, const char *);
char * resume_stopped_task_omp (credentials_t *, const char *, int, const char *);
char * start_task_omp (credentials_t *, const char *, int, const char *);
char * stop_task_omp (credentials_t *, const char *, int, const char *);

char * get_tasks_omp (credentials_t *, params_t *);

char * delete_report_omp (credentials_t *, params_t *);
char * get_report_omp (credentials_t *, const char *, const char *,
                       const char *, gsize *, const unsigned int,
                       const unsigned int, const char *, const char *,
                       const char *, const char *, const char *, const char *,
                       const char *, const char *, const char *, const char *,
                       const unsigned int, const unsigned int, const char *,
                       const char *, const char *, const char *, const char *,
                       const char *, const char *, const char *, gchar **,
                       char **);

char * get_result_omp (credentials_t *, const char *, const char *,
                       const char *, const char *, const char *,
                       const char *, const char *, const char *,
                       const char *, const char *, const char *,
                       const char *, const char *, const char *,
                       const char *, const char *, const char *,
                       const char *);

char * create_escalator_omp (credentials_t *, params_t *);
char * delete_escalator_omp (credentials_t *, params_t *);
char * delete_trash_escalator_omp (credentials_t *, params_t *);
char * test_escalator_omp (credentials_t *, const char *, const char *,
                           const char *);
char * get_escalator_omp (credentials_t *, const char *, const char *,
                          const char *);
char * get_escalators_omp (credentials_t *, const char *, const char *);

char * get_lsc_credential_omp (credentials_t *, params_t *);
int get_lsc_credentials_omp (credentials_t *, const char *, const char *,
                             gsize *, const char *, const char *, char **,
                             char **);
char * create_lsc_credential_omp (credentials_t *, params_t *);
char * delete_lsc_credential_omp (credentials_t *, params_t *);
char * delete_trash_lsc_credential_omp (credentials_t *, params_t *);
char * edit_lsc_credential_omp (credentials_t *, params_t *);
char * save_lsc_credential_omp (credentials_t *, params_t *);

int get_agents_omp (credentials_t *, const char *, const char *,
                    gsize *, const char *, const char *, char **, char **);
char * create_agent_omp (credentials_t *, params_t *);
char * delete_agent_omp (credentials_t *, params_t *);
char * delete_trash_agent_omp (credentials_t *, params_t *);
char * verify_agent_omp (credentials_t *, const char *);

char * create_schedule_omp (credentials_t *, params_t *);

char * delete_schedule_omp (credentials_t *, params_t *);
char * delete_trash_schedule_omp (credentials_t *, params_t *);
char * get_schedule_omp (credentials_t *, const char *, const char *,
                         const char *);
char * get_schedules_omp (credentials_t *, const char *, const char *);

char * get_target_omp (credentials_t *, const char *, const char *,
                       const char *);
char * get_targets_omp (credentials_t *, const char *, const char *);
char * create_target_omp (credentials_t *, params_t *);
char * delete_target_omp (credentials_t *, params_t *);
char * delete_trash_target_omp (credentials_t *, params_t *);

char * get_config_omp (credentials_t *, const char *, int);
char * get_configs_omp (credentials_t *, const char *, const char *);
char * save_config_omp (credentials_t *, params_t *);
char * get_config_family_omp (credentials_t *, const char *, const char *,
                              const char *, const char *, const char *, int);
char * save_config_family_omp (credentials_t *, const char *, const char *,
                               const char *, const char *, const char *,
                               GArray *);
char * get_config_nvt_omp (credentials_t *, const char *, const char *,
                           const char *, const char *, const char *,
                           const char *, int);
char * save_config_nvt_omp (credentials_t *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, GArray *, GArray *, GArray *,
                            const char *);
char * create_config_omp (credentials_t *, params_t *);
char * import_config_omp (credentials_t *, params_t *);
char * delete_config_omp (credentials_t *, params_t *);
char * delete_trash_config_omp (credentials_t *, params_t *);
char * export_config_omp (credentials_t *, const char *, enum content_type*,
                          char **, gsize *);

char * export_preference_file_omp (credentials_t *, const char *, const char *,
                                   const char *, enum content_type *, char **,
                                   gsize *);
char * export_report_format_omp (credentials_t *, const char *,
                                 enum content_type *, char **, gsize *);

char * get_notes_omp (credentials_t *);
char * get_note_omp (credentials_t *, params_t *);
char * new_note_omp (credentials_t *, params_t *);
char * create_note_omp (credentials_t *, const char *, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *, const char *,
                        const unsigned int, const unsigned int, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *);
char * delete_note_omp (credentials_t *, params_t *);
char * edit_note_omp (credentials_t *, params_t *);
char * save_note_omp (credentials_t *, params_t *);

char * get_overrides_omp (credentials_t *);
char * get_override_omp (credentials_t *, const char *);
char * new_override_omp (credentials_t *, params_t *);
char * create_override_omp (credentials_t *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *,
                            const unsigned int, const unsigned int,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *);
char * delete_override_omp (credentials_t *, params_t *);
char * edit_override_omp (credentials_t *, const char *, const char *,
                          const char *, const unsigned int, const unsigned int,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *);
char * save_override_omp (credentials_t *, params_t *);

char * get_slave_omp (credentials_t *, const char *, const char *,
                      const char *);
char * get_slaves_omp (credentials_t *, const char *, const char *);
char * create_slave_omp (credentials_t *, params_t *);
char * delete_slave_omp (credentials_t *, params_t *);
char * delete_trash_slave_omp (credentials_t *, params_t *);

char * get_system_reports_omp (credentials_t *, const char *, const char *);
char * get_system_report_omp (credentials_t *, const char *, const char *,
                              const char *, enum content_type*, char **,
                              gsize *);

char * get_report_format_omp (credentials_t *, const char *, const char *,
                              const char *);
char * get_report_formats_omp (credentials_t *, const char *, const char *);
char * delete_report_format_omp (credentials_t *, params_t *);
char * delete_trash_report_format_omp (credentials_t *, params_t *);
char * edit_report_format_omp (credentials_t *, const char *, const char *,
                               const char *, const char *);
char * import_report_format_omp (credentials_t *, params_t *);
char * save_report_format_omp (credentials_t *, params_t *);
char * verify_report_format_omp (credentials_t *, const char *);

char * get_trash_omp (credentials_t *, const char *, const char *);
char * restore_omp (credentials_t *, const char *);
char * empty_trashcan_omp (credentials_t *, params_t *);

int authenticate_omp (const gchar *, const gchar *);

char * get_nvts_omp (credentials_t *, const char *);

#endif /* not _GSAD_OMP_H */
