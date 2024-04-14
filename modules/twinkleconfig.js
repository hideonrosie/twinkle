// <nowiki>


(function($) {


	/*
	 ****************************************
	 *** twinkleconfig.js: Preferences module
	 ****************************************
	 * Mode of invocation:     Adds configuration form to Wikipedia:Twinkle/Preferences,
							   and adds an ad box to the top of user subpages belonging to the
							   currently logged-in user which end in '.js'
	 * Active on:              What I just said.  Yeah.
	
	 I, [[User:This, that and the other]], originally wrote this.  If the code is misbehaving, or you have any
	 questions, don't hesitate to ask me.  (This doesn't at all imply [[WP:OWN]]ership - it's just meant to
	 point you in the right direction.)  -- TTO
	 */
	
	
	Twinkle.config = {};
	
	Twinkle.config.watchlistEnums = { yes: 'Thêm vào danh sách theo dõi', no: "Không thêm vào danh sách theo dõi", 'default': 'Thực hiện theo các tùy chỉnh trang của bạn' };
	
	Twinkle.config.commonSets = {
		csdCriteria: {
			db: 'Lý do tùy chỉnh ({{db}})',
			c1: 'C1', c2: 'C2', c3: 'C3', c4: 'C4', c5: 'C5', c6: 'C6', c7: 'C7', c8: 'C8', c9: 'C9', c10: 'C10', c11: 'C11', c12: 'C12', c13: 'C13',
			bv1: 'BV1', bv2: 'BV2', bv3: 'BV3', bv4: 'BV4',
			đh1: 'ĐH1', đh2: 'ĐH2', đh3: 'ĐH3', đh4: 'ĐH4',
			tt1: 'TT1', tt2: 'TT2', tt3: 'TT3', tt4: 'TT4', tt5: 'TT5', tt6: 'TT6', tt7: 'TT7', tt8: 'TT8', tt9: 'TT9', tt10: 'TT10', tt11: 'TT11',
			bm1: 'BM1', bm2: 'BM2', bm3: 'BM3',
			tl1: 'TL1', tl2: 'TL2',
			tv1: 'TV1', tv2: 'TV2', tv3: 'TV3',
			ctt1: 'CTT1', ctt2: 'CTT2'
		},
		csdCriteriaDisplayOrder: [
			'db',
			'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13',
			'bv1', 'bv2', 'bv3', 'bv4',
			'đh1', 'đh2', 'đh3', 'đh4',
			'tt1', 'tt2', 'tt3', 'tt4', 'tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10', 'tt11',
			'bm1', 'bm2', 'bm3',
			'tl1', 'tl2',
			'tv1', 'tv2', 'tv3',
			'ctt1', 'ctt2'
		],
		csdCriteriaNotification: {
			db: 'Lý do tùy chỉnh ({{db}})',
			c1: 'C1', c2: 'C2', c3: 'C3', c4: 'C4', c5: 'C5', c6: 'C6', c7: 'C7', c8: 'C8', c9: 'C9', c10: 'C10', c11: 'C11', c12: 'C12', c13: 'C13',
			bv1: 'BV1', bv2: 'BV2', bv3: 'BV3', bv4: 'BV4',
			đh1: 'ĐH1', đh2: 'ĐH2', đh3: 'ĐH3', đh4: 'ĐH4',
			tt1: 'TT1', tt2: 'TT2', tt3: 'TT3', tt4: 'TT4', tt5: 'TT5', tt6: 'TT6', tt7: 'TT7', tt8: 'TT8', tt9: 'TT9', tt10: 'TT10', tt11: 'TT11',
			bm1: 'BM1', bm2: 'BM2', bm3: 'BM3',
			tl1: 'TL1', tl2: 'TL2',
			tv1: 'TV1', tv2: 'TV2', tv3: 'TV3',
			ctt1: 'CTT1', ctt2: 'CTT2'
		},
		csdCriteriaNotificationDisplayOrder: [
			'db',
			'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13',
			'bv1', 'bv2', 'bv3', 'bv4',
			'đh1', 'đh2', 'đh3', 'đh4',
			'tt1', 'tt2', 'tt3', 'tt4', 'tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10', 'tt11',
			'bm1', 'bm2', 'bm3',
			'tl1', 'tl2',
			'tv1', 'tv2', 'tv3',
			'ctt1', 'ctt2'
		],
		csdAndDICriteria: {
			db: 'Lý do tùy chỉnh ({{db}})',
			c1: 'C1', c2: 'C2', c3: 'C3', c4: 'C4', c5: 'C5', c6: 'C6', c7: 'C7', c8: 'C8', c9: 'C9', c10: 'C10', c11: 'C11', c12: 'C12', c13: 'C13',
			bv1: 'BV1', bv2: 'BV2', bv3: 'BV3', bv4: 'BV4',
			đh1: 'ĐH1', đh2: 'ĐH2', đh3: 'ĐH3', đh4: 'ĐH4',
			tt1: 'TT1', tt2: 'TT2', tt3: 'TT3', tt4: 'TT4', tt5: 'TT5', tt6: 'TT6', tt7: 'TT7', tt8: 'TT8', tt9: 'TT9', tt10: 'TT10', tt11: 'TT11',
			bm1: 'BM1', bm2: 'BM2', bm3: 'BM3',
			tl1: 'TL1', tl2: 'TL2',
			tv1: 'TV1', tv2: 'TV2', tv3: 'TV3',
			ctt1: 'CTT1', ctt2: 'CTT2'
		},
		csdAndDICriteriaDisplayOrder: [
			'db',
			'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13',
			'bv1', 'bv2', 'bv3', 'bv4',
			'đh1', 'đh2', 'đh3', 'đh4',
			'tt1', 'tt2', 'tt3', 'tt4', 'tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10', 'tt11',
			'bm1', 'bm2', 'bm3',
			'tl1', 'tl2',
			'tv1', 'tv2', 'tv3',
			'ctt1', 'ctt2'
		],
		namespacesNoSpecial: {
			'0': 'Article',
			'1': 'Talk (article)',
			'2': 'User',
			'3': 'User talk',
			'4': 'Wikipedia',
			'5': 'Wikipedia talk',
			'6': 'File',
			'7': 'File talk',
			'8': 'MediaWiki',
			'9': 'MediaWiki talk',
			'10': 'Template',
			'11': 'Template talk',
			'12': 'Help',
			'13': 'Help talk',
			'14': 'Category',
			'15': 'Category talk',
			'100': 'Portal',
			'101': 'Portal talk',
			'108': 'Book',
			'109': 'Book talk',
			'118': 'Draft',
			'119': 'Draft talk',
			'710': 'TimedText',
			'711': 'TimedText talk',
			'828': 'Module',
			'829': 'Module talk'
		}
	};
	
	/**
	 * Section entry format:
	 *
	 * {
	 *   title: <human-readable section title>,
	 *   module: <name of the associated module, used to link to sections>,
	 *   adminOnly: <true for admin-only sections>,
	 *   hidden: <true for advanced preferences that rarely need to be changed - they can still be modified by manually editing twinkleoptions.js>,
	 *   preferences: [
	 *     {
	 *       name: <TwinkleConfig property name>,
	 *       label: <human-readable short description - used as a form label>,
	 *       helptip: <(optional) human-readable text (using valid HTML) that complements the description, like limits, warnings, etc.>
	 *       adminOnly: <true for admin-only preferences>,
	 *       type: <string|boolean|integer|enum|set|customList> (customList stores an array of JSON objects { value, label }),
	 *       enumValues: <for type = "enum": a JSON object where the keys are the internal names and the values are human-readable strings>,
	 *       setValues: <for type = "set": a JSON object where the keys are the internal names and the values are human-readable strings>,
	 *       setDisplayOrder: <(optional) for type = "set": an array containing the keys of setValues (as strings) in the order that they are displayed>,
	 *       customListValueTitle: <for type = "customList": the heading for the left "value" column in the custom list editor>,
	 *       customListLabelTitle: <for type = "customList": the heading for the right "label" column in the custom list editor>
	 *     },
	 *     . . .
	 *   ]
	 * },
	 * . . .
	 *
	 */
	
	Twinkle.config.sections = [
		{
			title: 'Chung',
			module: 'general',
			preferences: [
				// TwinkleConfig.userTalkPageMode may take arguments:
				// 'window': open a new window, remember the opened window
				// 'tab': opens in a new tab, if possible.
				// 'blank': force open in a new window, even if such a window exists
				{
					name: 'userTalkPageMode',
					label: 'Khi mở một trang thảo luận của người dùng, hãy mở trang đó',
					type: 'enum',
					enumValues: { window: 'Trong một cửa sổ, thay thế các cuộc nói chuyện của người dùng khác', tab: 'Trong một tab mới', blank: 'Trong một cửa sổ hoàn toàn mới' }
				},
	
				// TwinkleConfig.dialogLargeFont (boolean)
				{
					name: 'dialogLargeFont',
					label: 'Sử dụng văn bản có kích thước lớn hơn trong hộp thoại Twinkle',
					type: 'boolean'
				},
	
				// Twinkle.config.disabledModules (array)
				{
					name: 'disabledModules',
					label: 'Tắt các mô đun Twinkle đã chọn',
					helptip: 'Bất kỳ thứ gì bạn chọn ở đây sẽ KHÔNG có sẵn để sử dụng, vì vậy hãy hành động cẩn thận. Bỏ chọn để kích hoạt lại.',
					type: 'set',
					//setValues: { arv: 'ARV', warn: 'Warn', welcome: 'Welcome', shared: 'Chia sẻ IP', talkback: 'Hồi âm', speedy: 'CSD', prod: 'PROD', xfd: 'XfD', image: 'Image (DI)', protect: 'Protect (RPP)', tag: 'Gán nhãn', diff: 'Diff', unlink: 'Unlink', 'fluff': 'Revert and rollback' }
					setValues: { arv: 'Báo cáo phá hoại', warn: 'Cảnh báo', welcome: 'Chào mừng thành viên', shared: 'Chia sẻ IP', talkback: 'Hồi âm', speedy: 'Xóa nhanh', prod: 'Đề nghị xóa', xfd: 'Thảo luận xóa', image: 'Đề nghị xóa hình', protect: 'Khóa trang', tag: 'Gán nhãn (thẻ)', diff: 'Khác biệt phiên bản', unlink: 'Gỡ liên kết', 'fluff': 'Lùi sửa và hồi sửa' }
				},
	
				// Twinkle.config.disabledSysopModules (array)
				{
					name: 'disabledSysopModules',
					label: 'Tắt các mô-đun chỉ dành cho quản trị viên đã chọn',
					helptip: 'Bất kỳ thứ gì bạn chọn ở đây sẽ KHÔNG có sẵn để sử dụng, vì vậy hãy thao tác cẩn thận. Bỏ chọn để kích hoạt lại.',
					adminOnly: true,
					type: 'set',
					setValues: { block: 'Khóa (Block)', deprod: 'Xóa hàng loạt theo đề xuất (DePROD)', batchdelete: 'Xóa hàng loạt theo thể loại (D-batch)', batchprotect: 'Khóa/bảo vệ hàng loại (P-batch)', batchundelete: 'Phục hồi xóa hàng loạt (Und-batch)' }
				}
			]
		},
	
		{
			title: 'ARV',
			module: 'arv',
			preferences: [
				{
					name: 'spiWatchReport',
					label: 'Thêm các trang báo cáo sockpuppet (rối) vào danh sách theo dõi',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				}
			]
		},
	
		{
			title: 'Khóa người dùng',
			module: 'block',
			adminOnly: true,
			preferences: [
				// TwinkleConfig.defaultToPartialBlocks (boolean)
				// Whether to default partial blocks on or off
				{
					name: 'defaultToPartialBlocks',
					label: 'Chọn các khóa một phần theo mặc định khi mở menu khóa',
					type: 'boolean'
				},
	
				// TwinkleConfig.blankTalkpageOnIndefBlock (boolean)
				// if true, blank the talk page when issuing an indef block notice (per [[WP:UWUL#Indefinitely blocked users]])
				{
					name: 'blankTalkpageOnIndefBlock',
					label: 'Làm trống trang thảo luận khi khóa vô hạn thành viên',
					helptip: 'Xem <a href="' + mw.util.getUrl('Wikipedia:WikiProject_User_warnings/Usage_and_layout#Indefinitely_blocked_users') + '">WP:UWUL</a> để có thêm thông tin.',
					type: 'boolean'
				}
			]
		},
	
		{
			title: 'Xóa hình ảnh (image deletion - DI)',
			module: 'image',
			preferences: [
				// TwinkleConfig.notifyUserOnDeli (boolean)
				// If the user should be notified after placing a file deletion tag
				{
					name: 'notifyUserOnDeli',
					label: 'Kiểm tra hộp "thông báo cho người tải lên đầu tiên" theo mặc định',
					type: 'boolean'
				},
	
				// TwinkleConfig.deliWatchPage (string)
				// The watchlist setting of the page tagged for deletion. Either "yes", "no", or "default". Default is "default" (Duh).
				{
					name: 'deliWatchPage',
					label: 'Thêm hình trang hình ảnh vào danh sách theo dõi khi gán nhãn',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				// TwinkleConfig.deliWatchUser (string)
				// The watchlist setting of the user talk page if a notification is placed. Either "yes", "no", or "default". Default is "default" (Duh).
				{
					name: 'deliWatchUser',
					label: 'Thêm trang thảo luận của người dùng tải lên đầu tiên vào danh sách theo dõi khi thông báo',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				}
			]
		},
	
		{
			title: 'Đề nghị xóa hình (PROD)',
			module: 'prod',
			preferences: [
				// TwinkleConfig.watchProdPages (boolean)
				// If, when applying prod template to page, to watch the page
				{
					name: 'watchProdPages',
					label: 'Thêm bài viết vào danh sách theo dõi khi gán nhãn',
					type: 'boolean'
				},
	
				// TwinkleConfig.markProdPagesAsPatrolled (boolean)
				// If, when applying prod template to page, to mark the page as curated/patrolled (if the page was reached from NewPages)
				{
					name: 'markProdPagesAsPatrolled',
					label: 'Đánh dấu trang đã được tuần tra/xem xét khi gán nhãn (nếu có thể)',
					helptip: 'Điều này có lẽ không nên làm vì đi ngược lại phương pháp tốt nhất là đồng thuận',
					type: 'boolean'
				},
	
				// TwinkleConfig.prodReasonDefault (string)
				// The prefilled PROD reason.
				{
					name: 'prodReasonDefault',
					label: 'Điền trước lý do đề xuất xóa (PROD)',
					type: 'string'
				},
	
				{
					name: 'logProdPages',
					label: 'Giữ nhật trình ở không gian người dùng đối với tất cả trang mà bạn gán nhãn theo đề xuất xóa (PROD)',
					helptip: 'Vì những người không phải là quản trị viên không có quyền truy cập vào các đóng góp đã bị xóa, nhật trình không gian người dùng cung cấp một cách tốt để theo dõi tất cả các trang mà bạn gán nhãn đề xuất xóa (PROD) bằng Twinkle.',
					type: 'boolean'
				},
				{
					name: 'prodLogPageName',
					label: 'Giữ nhật trình không gian người dùng PROD tại trang con',
					helptip: 'Nhập tên trang con vào ô này. Bạn sẽ tìm thấy nhật ký đề xuất xóa (PROD) của mình tại Người dùng:<i>Tên thành viên</i>/<i>Tên trang con</i>. Chỉ hoạt động nếu bạn bật chế độ ghi nhật trình không gian người dùng theo đề xuất xóa (PROD).',
					type: 'string'
				}
			]
		},
	
		{
			title: 'Hồi sửa (revert) và lùi sửa (rollback)',  // twinklefluff module
			module: 'fluff',
			preferences: [
				// TwinkleConfig.autoMenuAfterRollback (bool)
				// Option to automatically open the warning menu if the user talk page is opened post-reversion
				{
					name: 'autoMenuAfterRollback',
					label: 'Tự động mở menu cảnh báo Twinkle trên trang thảo luận của người dùng sau khi lùi sửa bằng Twinkle ',
					helptip: 'Chỉ hoạt động nếu các chức năng tương ứng bên dưới được chọn.',
					type: 'boolean'
				},
	
				// TwinkleConfig.openTalkPage (array)
				// What types of actions that should result in opening of talk page
				{
					name: 'openTalkPage',
					label: 'Mở trang thảo luận người dùng sau các dạng đảo ngược (reversion) này',
					type: 'set',
					setValues: { agf: 'Lùi sửa thiện chí (Assume Good Faith - AGF)', norm: 'Lùi sửa bình thường', vand: 'Lùi sửa phá hoại' }
				},
	
				// TwinkleConfig.openTalkPageOnAutoRevert (bool)
				// Defines if talk page should be opened when calling revert from contribs or recent changes pages. If set to true, openTalkPage defines then if talk page will be opened.
				{
					name: 'openTalkPageOnAutoRevert',
					label: 'Mở trang thảo luận người dùng khi khôi phục lùi sửa từ các đóng góp người dùng hoặc các thay đổi gần đây',
					helptip: 'Khi tính năng này được bật, các tùy chọn mong muốn phải được bật ở cài đặt trước đó để tính năng này hoạt động.',
					type: 'boolean'
				},
	
				// TwinkleConfig.rollbackInPlace (bool)
				//
				{
					name: 'rollbackInPlace',
					label: "Không tải lại trang khi lùi sửa từ các đóng góp hoặc các thay đổi gần đây",
					helptip: "Khi tính năng này được bật, Twinkle sẽ không tải lại nguồn cấp dữ liệu các đóng góp hoặc thay đổi gần đây sau khi hồi sửa, cho phép bạn hồi sửa nhiều sửa đổi cùng một lúc.",
					type: 'boolean'
				},
	
				// TwinkleConfig.markRevertedPagesAsMinor (array)
				// What types of actions that should result in marking edit as minor
				{
					name: 'markRevertedPagesAsMinor',
					label: 'Đánh dấu là chỉnh sửa nhỏ cho các loại đảo ngược (reversion) này',
					type: 'set',
					setValues: { agf: 'Lùi sửa thiện chí (Assume Good Faith - AGF)', norm: 'Lùi sửa bình thường', vand: 'Lùi sửa phá hoại', torev: '"Khôi phục phiên bản"' }
				},
	
				// TwinkleConfig.watchRevertedPages (array)
				// What types of actions that should result in forced addition to watchlist
				{
					name: 'watchRevertedPages',
					label: 'Thêm các trang vào danh sách theo dõi cho các dạng đảo ngược (reversion) này',
					type: 'set',
					setValues: { agf: 'Lùi sửa thiện chí (Assume Good Faith - AGF)', norm: 'Lùi sửa bình thường', vand: 'Lùi sửa phá hoại', torev: '"Khôi phục phiên bản"' }
				},
	
				// TwinkleConfig.offerReasonOnNormalRevert (boolean)
				// If to offer a prompt for extra summary reason for normal reverts, default to true
				{
					name: 'offerReasonOnNormalRevert',
					label: 'Nhắc lý do cho các lần lùi sửa bình thường',
					helptip: 'Các lùi sửa "bình thường" là những lùi sửa được khôi phục từ liên kết [lùi sửa] nằm ở chính giữa.',
					type: 'boolean'
				},
	
				{
					name: 'confirmOnFluff',
					label: 'Cung cấp một thông báo xác nhận trước khi hồi sửa',
					helptip: 'Dành cho những người sử dụng bút hoặc thiết bị cảm ứng và những người thường xuyên thiếu quyết đoán.',
					type: 'boolean'
				},
	
				// TwinkleConfig.showRollbackLinks (array)
				// Where Twinkle should show rollback links:
				// diff, others, mine, contribs, history, recent
				// Note from TTO: |contribs| seems to be equal to |others| + |mine|, i.e. redundant, so I left it out heres
				{
					name: 'showRollbackLinks',
					label: 'Hiển thị liên kết lùi sửa trên các trang này',
					type: 'set',
					setValues: { diff: 'Các trang khác biệt', others: 'Các trang đóng góp của những người dùng khác', mine: 'Trang đóng góp của tôi', recent: 'Các thay đổi gần đây và các thay đổi liên quan đến các trang đặc biệt', history: 'Các trang lịch sử' }
				}
			]
		},
	
		{
			title: 'Đánh dấu chia sẻ IP',
			module: 'shared',
			preferences: [
				{
					name: 'markSharedIPAsMinor',
					label: 'Đánh dấu gán nhãn chia sẻ IP là một chỉnh sửa nhỏ',
					type: 'boolean'
				}
			]
		},
	
		{
			title: 'Xóa nhanh (CSD)',
			module: 'speedy',
			preferences: [
				{
					name: 'speedySelectionStyle',
					label: 'Khi nào nên tiếp tục và gán nhãn/xóa trang',
					type: 'enum',
					enumValues: { 'buttonClick': 'Khi tôi nhấn nút "Gửi" (hoặc Submit)', 'radioClick': 'Ngay khi tôi nhấn 1 lựa chọn nào đó' }
				},
	
				// TwinkleConfig.watchSpeedyPages (array)
				// Whether to add speedy tagged or deleted pages to watchlist
				{
					name: 'watchSpeedyPages',
					label: 'Thêm trang vào danh sách theo dõi khi sử dụng các tiêu chí này',
					type: 'set',
					setValues: Twinkle.config.commonSets.csdCriteria,
					setDisplayOrder: Twinkle.config.commonSets.csdCriteriaDisplayOrder
				},
	
				// TwinkleConfig.markSpeedyPagesAsPatrolled (boolean)
				// If, when applying speedy template to page, to mark the page as triaged/patrolled (if the page was reached from NewPages)
				{
					name: 'markSpeedyPagesAsPatrolled',
					label: 'Đánh dấu trang là đã được tuần tra/xem xét khi gán nhãn (nếu có thể)',
					helptip: 'Điều này có lẽ không nên làm vì đi ngược lại phương pháp tốt nhất là đồng thuận',
					type: 'boolean'
				},
	
				// TwinkleConfig.welcomeUserOnSpeedyDeletionNotification (array of strings)
				// On what types of speedy deletion notifications shall the user be welcomed
				// with a "firstarticle" notice if their talk page has not yet been created.
				{
					name: 'welcomeUserOnSpeedyDeletionNotification',
					label: 'Chào mừng người tạo trang khi thông báo với các tiêu chí này',
					helptip: 'Lời chào mừng chỉ được đưa ra nếu người dùng đã được thông báo về việc xóa và chỉ khi trang thảo luận của họ chưa tồn tại. Bản mẫu được dùng là {{firstarticle}}.',
					type: 'set',
					setValues: Twinkle.config.commonSets.csdCriteriaNotification,
					setDisplayOrder: Twinkle.config.commonSets.csdCriteriaNotificationDisplayOrder
				},
	
				// TwinkleConfig.notifyUserOnSpeedyDeletionNomination (array)
				// What types of actions should result in the author of the page being notified of nomination
				{
					name: 'notifyUserOnSpeedyDeletionNomination',
					label: 'Thông báo cho người tạo trang khi gán nhãn với các tiêu chí này',
					helptip: 'Ngay cả khi bạn chọn thông báo từ màn hình tiêu chí xóa nhanh (CSD), thông báo sẽ chỉ diễn ra đối với những tiêu chí được chọn ở đây.',
					type: 'set',
					setValues: Twinkle.config.commonSets.csdCriteriaNotification,
					setDisplayOrder: Twinkle.config.commonSets.csdCriteriaNotificationDisplayOrder
				},
	
				// TwinkleConfig.warnUserOnSpeedyDelete (array)
				// What types of actions should result in the author of the page being notified of speedy deletion (admin only)
				{
					name: 'warnUserOnSpeedyDelete',
					label: 'Thông báo cho người tạo trang khi xóa theo các tiêu chí này',
					helptip: 'Ngay cả khi bạn chọn thông báo từ màn hình tiêu chí xóa nhanh (CSD), thông báo sẽ chỉ diễn ra đối với những tiêu chí được chọn ở đây.',
					adminOnly: true,
					type: 'set',
					setValues: Twinkle.config.commonSets.csdCriteriaNotification,
					setDisplayOrder: Twinkle.config.commonSets.csdCriteriaNotificationDisplayOrder
				},
	
				// TwinkleConfig.promptForSpeedyDeletionSummary (array of strings)
				{
					name: 'promptForSpeedyDeletionSummary',
					label: 'Cho phép chỉnh sửa tóm tắt xóa khi xóa theo các tiêu chí này',
					adminOnly: true,
					type: 'set',
					setValues: Twinkle.config.commonSets.csdAndDICriteria,
					setDisplayOrder: Twinkle.config.commonSets.csdAndDICriteriaDisplayOrder
				},
	
				// TwinkleConfig.deleteTalkPageOnDelete (boolean)
				// If talk page if exists should also be deleted (CSD G8) when spedying a page (admin only)
				{
					name: 'deleteTalkPageOnDelete',
					label: 'Chọn "cũng xóa trang thảo luận" theo mặc định',
					adminOnly: true,
					type: 'boolean'
				},
	
				{
					name: 'deleteRedirectsOnDelete',
					label: 'Chọn "cũng xóa chuyển hướng" theo mặc định',
					adminOnly: true,
					type: 'boolean'
				},
	
				// TwinkleConfig.deleteSysopDefaultToDelete (boolean)
				// Make the CSD screen default to "delete" instead of "tag" (admin only)
				{
					name: 'deleteSysopDefaultToDelete',
					label: 'Mặc định để xóa hẳn thay vì gán nhãn xóa nhanh',
					helptip: 'Nếu đã có nhãn tiêu chí xóa nhanh  (CSD), Twinkle sẽ luôn mặc định ở chế độ "xóa"',
					adminOnly: true,
					type: 'boolean'
				},
	
				// TwinkleConfig.speedyWindowWidth (integer)
				// Defines the width of the Twinkle SD window in pixels
				{
					name: 'speedyWindowWidth',
					label: 'Chiều rộng của cửa sổ xóa nhanh (pixel)',
					type: 'integer'
				},
	
				// TwinkleConfig.speedyWindowWidth (integer)
				// Defines the width of the Twinkle SD window in pixels
				{
					name: 'speedyWindowHeight',
					label: 'Chiều cao của cửa sổ xóa nhanh (pixel)',
					helptip: 'Nếu bạn có một màn hình lớn, bạn có thể muốn tăng giá trị này lên.',
					type: 'integer'
				},
	
				{
					name: 'logSpeedyNominations',
					label: 'Giữ nhật trình trong không gian người dùng của tất cả các đề cử theo tiêu chí xóa nhanh (CSD)',
					helptip: 'Vì những người không phải là quản trị viên không có quyền truy cập vào các đóng góp đã bị xóa, nhật ký không gian người dùng cung cấp một cách tốt nhất để theo dõi tất cả các trang đã đề cử theo tiêu chí xóa nhanh (CSD) khi sử dụng Twinkle. Các tập tin được gán nhãn xóa hình (DI) cũng được thêm vào nhật ký này.',
					type: 'boolean'
				},
				{
					name: 'speedyLogPageName',
					label: 'Giữ nhật trình không gian người dùng theo tiêu chí xóa nhanh (CSD) tại trang con',
					helptip: 'Nhập tên trang con vào ô này. Bạn sẽ tìm thấy nhật ký tiêu chí xóa nhanh (CSD) của mình tại Thành viên: <i>Tên người dùng </i>/<i>Tên trang con</i>. Chỉ hoạt động nếu bạn bật nhật ký không gian người dùng theo tiêu chí xóa nhanh (CSD).',
					type: 'string'
				},
				{
					name: 'noLogOnSpeedyNomination',
					label: 'Không tạo mục nhập nhật trình không gian người dùng khi gán nhãn với các tiêu chí này',
					type: 'set',
					setValues: Twinkle.config.commonSets.csdAndDICriteria,
					setDisplayOrder: Twinkle.config.commonSets.csdAndDICriteriaDisplayOrder
				}
			]
		},
	
		{
			title: 'Gán nhãn',
			module: 'tag',
			preferences: [
				{
					name: 'watchTaggedPages',
					label: 'Thêm trang vào danh sách theo dõi khi gán nhãn',
					type: 'boolean'
				},
				{
					name: 'watchMergeDiscussions',
					label: 'Thêm các trang thảo luận vào danh sách theo dõi khi bắt đầu hợp nhất (trộn) thảo luận',
					type: 'boolean'
				},
				{
					name: 'markTaggedPagesAsMinor',
					label: 'Đánh dấu việc thêm nhãn là chỉnh sửa nhỏ',
					type: 'boolean'
				},
				{
					name: 'markTaggedPagesAsPatrolled',
					label: 'Chọn chức năng "đánh dấu trang là đã tuần tra/đã xem xét" theo mặc định',
					type: 'boolean'
				},
				{
					name: 'groupByDefault',
					label: 'Chọn chức năng hộp "gom nhóm thành {{nhiều vấn đề}}" theo mặc định',
					type: 'boolean'
				},
				{
					name: 'tagArticleSortOrder',
					label: 'Thứ tự xem mặc định cho các nhãn bài viết',
					type: 'enum',
					enumValues: { 'cat': 'Theo thể loại', 'alpha': 'Theo thứ tự ABC' }
				},
				{
					name: 'customTagList',
					label: 'Các nhãn bảo trì bài viết/bản nháp tùy chỉnh để hiển thị',
					helptip: "Các nhãn này xuất hiện dưới dạng các tùy chỉnh bổ sung ở cuối danh sách nhãn. Ví dụ: bạn có thể thêm các nhãn bảo trì mới chưa được thêm vào mặc định của Twinkle.",
					type: 'customList',
					customListValueTitle: 'Tên bản mẫu (không có dấu ngoặc nhọn)',
					customListLabelTitle: 'Nội dung hiển thị trong hộp thoại Nhãn'
				},
				{
					name: 'customFileTagList',
					label: 'Các nhãn bảo trì tập tin tùy chỉnh để hiển thị',
					helptip: 'Các nhãn bổ sung mà bạn muốn thêm cho các tập tin.',
					type: 'customList',
					customListValueTitle: 'Tên bản mẫu (không có dấu ngoặc nhọn)',
					customListLabelTitle: 'Văn bản hiển thị trong hộp thoại Nhãn'
				},
				{
					name: 'customRedirectTagList',
					label: 'Các nhãn chuyển hướng danh mục tùy chỉnh để hiển thị',
					helptip: 'Các nhãn bổ sung mà bạn muốn thêm cho chuyển hướng.',
					type: 'customList',
					customListValueTitle: 'Tên bản mẫu (không có dấu ngoặc nhọn)',
					customListLabelTitle: 'Văn bản hiển thị trong hộp thoại Nhãn'
				}
			]
		},
	
		{
			title: 'Hồi âm',
			module: 'talkback',
			preferences: [
				{
					name: 'markTalkbackAsMinor',
					label: 'Đánh dấu hồi âm là chỉnh sửa nhỏ',
					type: 'boolean'
				},
				{
					name: 'insertTalkbackSignature',
					label: 'Chèn chữ ký trong hồi âm',
					type: 'boolean'
				},
				{
					name: 'talkbackHeading',
					label: 'Phần tiêu đề sử dụng cho các cuộc hồi âm',
					type: 'string'
				},
				{
					name: 'adminNoticeHeading',
					label: "Phần tiêu đề sử dụng cho các thông báo trên bảng thông báo của quản trị viên",
					helptip: 'Chỉ phù hợp với AN và ANI.',
					type: 'string'
				},
				{
					name: 'mailHeading',
					label: "Phần tiêu đề sử dụng cho các thông báo \"Bạn đã có thư\"",
					type: 'string'
				}
			]
		},
	
		{
			title: 'Gỡ liên kết',
			module: 'unlink',
			preferences: [
				// TwinkleConfig.unlinkNamespaces (array)
				// In what namespaces unlink should happen, default in 0 (article), 10 (template), 100 (portal), and 118 (draft)
				{
					name: 'unlinkNamespaces',
					label: 'Xóa liên kết khỏi các trang trong các không gian tên này',
					helptip: 'Tránh chọn bất kỳ không gian tên thảo luận nào, vì Twinkle có thể kết thúc việc hủy liên kết ở các kho lưu trữ thảo luận (một điều tuyệt đối không).',
					type: 'set',
					setValues: Twinkle.config.commonSets.namespacesNoSpecial
				}
			]
		},
	
		{
			title: 'Cảnh báo người dùng',
			module: 'warn',
			preferences: [
				// TwinkleConfig.defaultWarningGroup (int)
				// Which level warning should be the default selected group, default is 1
				{
					name: 'defaultWarningGroup',
					label: 'Mức cảnh báo mặc định',
					type: 'enum',
					enumValues: {
						'1': 'Mức 1',
						'2': 'Mức 2',
						'3': 'Mức 3',
						'4': 'Mức 4',
						'5': 'Mức 4im', // quên là mức gì?
						'6': 'Thông báo một vấn đề',
						'7': 'Cảnh báo một vấn đề',
						// 8 was used for block templates before #260
						'9': 'Cảnh báo tùy chỉnh',
						'10': 'Tất cả bản mẫu cảnh báo',
						'11': 'Tự chọn mức cảnh báo (1-4)'
					}
				},
	
				// TwinkleConfig.combinedSingletMenus (boolean)
				// if true, show one menu with both single-issue notices and warnings instead of two separately
				{
					name: 'combinedSingletMenus',
					label: 'Thay thế menu hai vấn đề riêng biệt thành một menu kết hợp',
					helptip: 'Chọn thông báo một vấn đề hoặc cảnh báo một vấn đề làm mặc định nếu tính năng này được kích hoạt.',
					type: 'boolean'
				},
	
				// TwinkleConfig.showSharedIPNotice may take arguments:
				// true: to show shared ip notice if an IP address
				// false: to not print the notice
				{
					name: 'showSharedIPNotice',
					label: 'Thêm thông báo bổ sung trên các trang thảo luận IP được chia sẻ',
					helptip: 'Thông báo được sử dụng là {{khuyên IP chung}}',
					type: 'boolean'
				},
	
				// TwinkleConfig.watchWarnings (boolean)
				// if true, watch the page which has been dispatched an warning or notice, if false, default applies
				{
					name: 'watchWarnings',
					label: 'Thêm trang thảo luận người dùng vào danh sách theo dõi khi thông báo',
					type: 'boolean'
				},
	
				// TwinkleConfig.oldSelect (boolean)
				// if true, use the native select menu rather the select2-based one
				{
					name: 'oldSelect',
					label: 'Sử dụng menu chọn cổ điển không có khả năng tìm kiếm',
					type: 'boolean'
				},
	
				{
					name: 'customWarningList',
					label: 'Các bản mẫu cảnh báo tùy chỉnh để hiển thị',
					helptip: 'Bạn có thể thêm các bản mẫu riêng lẻ hoặc các trang con người dùng. Cảnh báo tùy chỉnh xuất hiện ở danh mục "Cảnh báo tùy chỉnh" trong hộp thoại cảnh báo.',
					type: 'customList',
					customListValueTitle: 'Tên bản mẫu (không có dấu ngoặc nhọn)',
					customListLabelTitle: 'Nội dung hiển thị trong danh sách cảnh báo (cũng được sử dụng làm bản tóm tắt chỉnh sửa)'
				}
			]
		},
	
		{
			title: 'Chào mừng thành viên',
			module: 'welcome',
			preferences: [
				{
					name: 'topWelcomes',
					label: 'Đặt nội dung chào mừng phía trên nội dung trang thảo luận của người dùng hiện có',
					type: 'boolean'
				},
				{
					name: 'watchWelcomes',
					label: 'Thêm trang thảo luận người dùng vào danh sách theo dõi khi chào mừng',
					helptip: 'Làm như vậy để thêm yếu tố cá nhân của việc chào đón người dùng - bạn sẽ có thể thấy cách họ hoạt động với tư cách là một người mới và có thể giúp họ.',
					type: 'boolean'
				},
				{
					name: 'insertUsername',
					label: 'Thêm tên người dùng của bạn vào mẫu (nếu có)',
					helptip: "Một số bản mẫu chào mừng có câu mở đầu như \"Xin chào, tên tôi là &lt;username&gt;. Chào mừng\" v.v. Nếu bạn tắt tùy chỉnh này, các bản mẫu này sẽ không hiển thị tên người dùng của bạn theo cách này.",
					type: 'boolean'
				},
				{
					name: 'quickWelcomeMode',
					label: 'Nhấp vào liên kết "chào mừng" trên một trang khác biệt sửa đổi',
					helptip: 'Nếu bạn chọn chào mừng tự động, bản mẫu bạn chỉ định bên dưới sẽ được sử dụng.',
					type: 'enum',
					enumValues: { auto: 'chào mừng tự động', norm: 'bạn cần chọn một bản mẫu' }
				},
				{
					name: 'quickWelcomeTemplate',
					label: 'Bản mẫu để sử dụng khi chào mừng tự động',
					helptip: 'Nhập tên của bản mẫu chào mừng, không có dấu ngoặc nhọn. Một liên kết đến bài viết đã cho sẽ được thêm vào. Xem thêm [[Wikipedia:Bản mẫu hoan nghênh|danh sách các bản mẫu chào mừng]].',
					type: 'string'
				},
				{
					name: 'customWelcomeList',
					label: 'Các mẫu chào mừng tùy chỉnh để hiển thị',
					helptip: "Bạn có thể thêm các bản mẫu chào mừng khác hoặc các trang con của người dùng là các bản mẫu chào mừng (có tiền tố là \"Người dùng:\"). Đừng quên rằng các bản mẫu này được thay thế trên các trang thảo luận người dùng.",
					type: 'customList',
					customListValueTitle: 'Tên bản mẫu (không có dấu ngoặc nhọn)',
					customListLabelTitle: 'Nội dung hiển thị trong hộp thoại Chào mừng'
				},
				{
					name: 'customWelcomeSignature',
					label: 'Tự động ký tên các bản mẫu chào mừng tùy chỉnh',
					helptip: 'Nếu các bản mẫu chào mừng tùy chỉnh đã tích hợp chữ ký, hãy tắt tùy chỉnh này.',
					type: 'boolean'
				}
			]
		},
	
		{
			title: 'XFD (thảo luận xóa)',
			module: 'xfd',
			preferences: [
				{
					name: 'logXfdNominations',
					label: 'Giữ nhật trình trong không gian người dùng của tất cả các trang mà bạn đề cử thảo luận xóa (XfD)',
					helptip: 'Nhật trình không gian người dùng đem đến sự hữu ích khi theo dõi tất cả các trang mà bạn đề cử cho thảo luận xóa (XfD) bằng Twinkle.',
					type: 'boolean'
				},
				{
					name: 'xfdLogPageName',
					label: 'Giữ nhật trình không gian người dùng thảo luận xóa tại trang con của người dùng này',
					helptip: 'Nhập tên trang con vào ô này. Bạn sẽ tìm thấy nhật ký thảo luận xóa (XfD) của mình tại Thành viên:<i>Tên thành viên</i>/<i>Tên trang con</i>. Chỉ hoạt động nếu bạn bật nhật trình không gian người dùng thảo luận xóa (XfD).',
					type: 'string'
				},
				{
					name: 'noLogOnXfdNomination',
					label: 'Không ghi lại nhật trình không gian người dùng khi đề cử tại nơi này',
					type: 'set',
					setValues: { afd: 'AfD', tfd: 'TfD', ffd: 'FfD', cfd: 'CfD', cfds: 'CfD/S', mfd: 'MfD', rfd: 'RfD', rm: 'RM' }
				},
	
				// TwinkleConfig.xfdWatchPage (string)
				// The watchlist setting of the page being nominated for XfD. Either "yes" (add to watchlist), "no" (don't
				// add to watchlist), or "default" (use setting from preferences). Default is "default" (duh).
				{
					name: 'xfdWatchPage',
					label: 'Thêm trang được đề cử vào danh sách theo dõi',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				// TwinkleConfig.xfdWatchDiscussion (string)
				// The watchlist setting of the newly created XfD page (for those processes that create discussion pages for each nomination),
				// or the list page for the other processes.
				// Either "yes" (add to watchlist), "no" (don't add to watchlist), or "default" (use setting from preferences). Default is "default" (duh).
				{
					name: 'xfdWatchDiscussion',
					label: 'Thêm trang thảo luận xóa vào danh sách theo dõi',
					helptip: 'Điều này đề cập đến trang con thảo luận (cho AfD và MfD) hoặc trang nhật ký hàng ngày (cho TfD, CfD, RfD và FfD)',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				// TwinkleConfig.xfdWatchList (string)
				// The watchlist setting of the XfD list page, *if* the discussion is on a separate page. Either "yes" (add to watchlist), "no" (don't
				// add to watchlist), or "default" (use setting from preferences). Default is "no" (Hehe. Seriously though, who wants to watch it?
				// Sorry in advance for any false positives.).
				{
					name: 'xfdWatchList',
					label: 'Thêm trang nhật trình/danh sách hàng ngày vào danh sách theo dõi (nếu có)',
					helptip: 'Điều này chỉ áp dụng cho AfD và MfD với các cuộc thảo luận được đưa vào trang nhật trình hàng ngày (đối với AfD) hoặc trang chính MfD (đối với MfD).',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				// TwinkleConfig.xfdWatchUser (string)
				// The watchlist setting of the user talk page if they receive a notification. Either "yes" (add to watchlist), "no" (don't
				// add to watchlist), or "default" (use setting from preferences). Default is "default" (duh).
				{
					name: 'xfdWatchUser',
					label: 'Thêm trang thảo luận người dùng của người đóng góp ban đầu vào danh sách theo dõi (khi thông báo)',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				// TwinkleConfig.xfdWatchRelated (string)
				// The watchlist setting of the target of a redirect being nominated for RfD. Either "yes" (add to watchlist), "no" (don't
				// add to watchlist), or "default" (use setting from preferences). Default is "default" (duh).
				{
					name: 'xfdWatchRelated',
					label: "Thêm trang đích chuyển hướng vào danh sách theo dõi (khi thông báo)",
					helptip: 'Điều này chỉ áp dụng cho RfD, khi để lại thông báo trên trang thảo luận về mục tiêu chuyển hướng',
					type: 'enum',
					enumValues: Twinkle.config.watchlistEnums
				},
	
				{
					name: 'markXfdPagesAsPatrolled',
					label: 'Đánh dấu trang là đã được tuần tra/xem xét theo đề cử tiêu chí xóa theo thảo luận (AFD) (nếu có thể)',
					type: 'boolean'
				}
			]
		},
	
		{
			title: 'Hidden',
			hidden: true,
			preferences: [
				// twinkle.js: portlet setup
				{
					name: 'portletArea',
					type: 'string'
				},
				{
					name: 'portletId',
					type: 'string'
				},
				{
					name: 'portletName',
					type: 'string'
				},
				{
					name: 'portletType',
					type: 'string'
				},
				{
					name: 'portletNext',
					type: 'string'
				},
				// twinklefluff.js: defines how many revision to query maximum, maximum possible is 50, default is 50
				{
					name: 'revertMaxRevisions',
					type: 'integer'
				},
				// twinklewarn.js: When using the autolevel select option, how many days makes a prior warning stale
				// Huggle is three days ([[Special:Diff/918980316]] and [[Special:Diff/919417999]]) while ClueBotNG is two:
				// https://github.com/DamianZaremba/cluebotng/blob/4958e25d6874cba01c75f11debd2e511fd5a2ce5/bot/action_functions.php#L62
				{
					name: 'autolevelStaleDays',
					type: 'integer'
				},
				// How many pages should be queried by deprod and batchdelete/protect/undelete
				{
					name: 'batchMax',
					type: 'integer',
					adminOnly: true
				},
				// How many pages should be processed at a time by deprod and batchdelete/protect/undelete
				{
					name: 'batchChunks',
					type: 'integer',
					adminOnly: true
				}
			]
		}
	
	]; // end of Twinkle.config.sections
	
	
	Twinkle.config.init = function twinkleconfigInit() {
	
		// create the config page at Wikipedia:Twinkle/Preferences
		if ((mw.config.get('wgNamespaceNumber') === mw.config.get('wgNamespaceIds').project && mw.config.get('wgTitle') === 'Twinkle/Preferences') &&
				mw.config.get('wgAction') === 'view') {
	
			if (!document.getElementById('twinkle-config')) {
				return;  // maybe the page is misconfigured, or something - but any attempt to modify it will be pointless
			}
	
			// set style (the url() CSS function doesn't seem to work from wikicode - ?!)
			document.getElementById('twinkle-config-titlebar').style.backgroundImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAkCAMAAAB%2FqqA%2BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhQTFRFr73ZobTPusjdsMHZp7nVwtDhzNbnwM3fu8jdq7vUt8nbxtDkw9DhpbfSvMrfssPZqLvVztbno7bRrr7W1d%2Fs1N7qydXk0NjpkW7Q%2BgAAADVJREFUeNoMwgESQCAAAMGLkEIi%2FP%2BnbnbpdB59app5Vdg0sXAoMZCpGoFbK6ciuy6FX4ABAEyoAef0BXOXAAAAAElFTkSuQmCC)';
	
			var contentdiv = document.getElementById('twinkle-config-content');
			contentdiv.textContent = '';  // clear children
	
			// let user know about possible conflict with skin js/common.js file
			// (settings in that file will still work, but they will be overwritten by twinkleoptions.js settings)
			if (window.TwinkleConfig || window.FriendlyConfig) {
				var contentnotice = document.createElement('p');
				contentnotice.innerHTML = '<table class="plainlinks ombox ombox-content"><tr><td class="mbox-image">' +
					'<img alt="" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Imbox_content.png" /></td>' +
					'<td class="mbox-text"><p><big><b>Before modifying your settings here,</b> you must remove your old Twinkle and Friendly settings from your personal skin JavaScript.</big></p>' +
					'<p>To do this, you can <a href="' + mw.util.getUrl('User:' + mw.config.get('wgUserName') + '/' + mw.config.get('skin') +
					'.js', { action: 'edit' }) + '" target="_blank"><b>edit your personal skin javascript file</b></a> or <a href="' +
					mw.util.getUrl('User:' + mw.config.get('wgUserName') + '/common.js', { action: 'edit'}) + '" target="_blank"><b>your common.js file</b></a>, removing all lines of code that refer to <code>TwinkleConfig</code> and <code>FriendlyConfig</code>.</p>' +
					'</td></tr></table>';
				contentdiv.appendChild(contentnotice);
			}
	
			// start a table of contents
			var toctable = document.createElement('div');
			toctable.className = 'toc';
			toctable.style.marginLeft = '0.4em';
			// create TOC title
			var toctitle = document.createElement('div');
			toctitle.id = 'toctitle';
			var toch2 = document.createElement('h2');
			toch2.textContent = 'Nội dung ';
			toctitle.appendChild(toch2);
			// add TOC show/hide link
			var toctoggle = document.createElement('span');
			toctoggle.className = 'toctoggle';
			toctoggle.appendChild(document.createTextNode('['));
			var toctogglelink = document.createElement('a');
			toctogglelink.className = 'internal';
			toctogglelink.setAttribute('href', '#tw-tocshowhide');
			toctogglelink.textContent = 'hide';
			toctoggle.appendChild(toctogglelink);
			toctoggle.appendChild(document.createTextNode(']'));
			toctitle.appendChild(toctoggle);
			toctable.appendChild(toctitle);
			// create item container: this is what we add stuff to
			var tocul = document.createElement('ul');
			toctogglelink.addEventListener('click', function twinkleconfigTocToggle() {
				var $tocul = $(tocul);
				$tocul.toggle();
				if ($tocul.find(':visible').length) {
					toctogglelink.textContent = 'hide';
				} else {
					toctogglelink.textContent = 'show';
				}
			}, false);
			toctable.appendChild(tocul);
			contentdiv.appendChild(toctable);
	
			var contentform = document.createElement('form');
			contentform.setAttribute('action', 'javascript:void(0)');  // was #tw-save - changed to void(0) to work around Chrome issue
			contentform.addEventListener('submit', Twinkle.config.save, true);
			contentdiv.appendChild(contentform);
	
			var container = document.createElement('table');
			container.style.width = '100%';
			contentform.appendChild(container);
	
			$(Twinkle.config.sections).each(function(sectionkey, section) {
				if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
					return true;  // i.e. "continue" in this context
				}
	
				// add to TOC
				var tocli = document.createElement('li');
				tocli.className = 'toclevel-1';
				var toca = document.createElement('a');
				toca.setAttribute('href', '#' + section.module);
				toca.appendChild(document.createTextNode(section.title));
				tocli.appendChild(toca);
				tocul.appendChild(tocli);
	
				var row = document.createElement('tr');
				var cell = document.createElement('td');
				cell.setAttribute('colspan', '3');
				var heading = document.createElement('h4');
				heading.style.borderBottom = '1px solid gray';
				heading.style.marginTop = '0.2em';
				heading.id = section.module;
				heading.appendChild(document.createTextNode(section.title));
				cell.appendChild(heading);
				row.appendChild(cell);
				container.appendChild(row);
	
				var rowcount = 1;  // for row banding
	
				// add each of the preferences to the form
				$(section.preferences).each(function(prefkey, pref) {
					if (pref.adminOnly && !Morebits.userIsSysop) {
						return true;  // i.e. "continue" in this context
					}
	
					row = document.createElement('tr');
					row.style.marginBottom = '0.2em';
					// create odd row banding
					if (rowcount++ % 2 === 0) {
						row.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
					}
					cell = document.createElement('td');
	
					var label, input;
					switch (pref.type) {
	
						case 'boolean':  // create a checkbox
							cell.setAttribute('colspan', '2');
	
							label = document.createElement('label');
							input = document.createElement('input');
							input.setAttribute('type', 'checkbox');
							input.setAttribute('id', pref.name);
							input.setAttribute('name', pref.name);
							if (Twinkle.getPref(pref.name) === true) {
								input.setAttribute('checked', 'checked');
							}
							label.appendChild(input);
							label.appendChild(document.createTextNode(' ' + pref.label));
							cell.appendChild(label);
							break;
	
						case 'string':  // create an input box
						case 'integer':
							// add label to first column
							cell.style.textAlign = 'right';
							cell.style.paddingRight = '0.5em';
							label = document.createElement('label');
							label.setAttribute('for', pref.name);
							label.appendChild(document.createTextNode(pref.label + ':'));
							cell.appendChild(label);
							row.appendChild(cell);
	
							// add input box to second column
							cell = document.createElement('td');
							cell.style.paddingRight = '1em';
							input = document.createElement('input');
							input.setAttribute('type', 'text');
							input.setAttribute('id', pref.name);
							input.setAttribute('name', pref.name);
							if (pref.type === 'integer') {
								input.setAttribute('size', 6);
								input.setAttribute('type', 'number');
								input.setAttribute('step', '1');  // integers only
							}
							if (Twinkle.getPref(pref.name)) {
								input.setAttribute('value', Twinkle.getPref(pref.name));
							}
							cell.appendChild(input);
							break;
	
						case 'enum':  // create a combo box
							// add label to first column
							// note: duplicates the code above, under string/integer
							cell.style.textAlign = 'right';
							cell.style.paddingRight = '0.5em';
							label = document.createElement('label');
							label.setAttribute('for', pref.name);
							label.appendChild(document.createTextNode(pref.label + ':'));
							cell.appendChild(label);
							row.appendChild(cell);
	
							// add input box to second column
							cell = document.createElement('td');
							cell.style.paddingRight = '1em';
							input = document.createElement('select');
							input.setAttribute('id', pref.name);
							input.setAttribute('name', pref.name);
							$.each(pref.enumValues, function(enumvalue, enumdisplay) {
								var option = document.createElement('option');
								option.setAttribute('value', enumvalue);
								if (Twinkle.getPref(pref.name) === enumvalue) {
									option.setAttribute('selected', 'selected');
								}
								option.appendChild(document.createTextNode(enumdisplay));
								input.appendChild(option);
							});
							cell.appendChild(input);
							break;
	
						case 'set':  // create a set of check boxes
							// add label first of all
							cell.setAttribute('colspan', '2');
							label = document.createElement('label');  // not really necessary to use a label element here, but we do it for consistency of styling
							label.appendChild(document.createTextNode(pref.label + ':'));
							cell.appendChild(label);
	
							var checkdiv = document.createElement('div');
							checkdiv.style.paddingLeft = '1em';
							var worker = function(itemkey, itemvalue) {
								var checklabel = document.createElement('label');
								checklabel.style.marginRight = '0.7em';
								checklabel.style.display = 'inline-block';
								var check = document.createElement('input');
								check.setAttribute('type', 'checkbox');
								check.setAttribute('id', pref.name + '_' + itemkey);
								check.setAttribute('name', pref.name + '_' + itemkey);
								if (Twinkle.getPref(pref.name) && Twinkle.getPref(pref.name).indexOf(itemkey) !== -1) {
									check.setAttribute('checked', 'checked');
								}
								// cater for legacy integer array values for unlinkNamespaces (this can be removed a few years down the track...)
								if (pref.name === 'unlinkNamespaces') {
									if (Twinkle.getPref(pref.name) && Twinkle.getPref(pref.name).indexOf(parseInt(itemkey, 10)) !== -1) {
										check.setAttribute('checked', 'checked');
									}
								}
								checklabel.appendChild(check);
								checklabel.appendChild(document.createTextNode(itemvalue));
								checkdiv.appendChild(checklabel);
							};
							if (pref.setDisplayOrder) {
								// add check boxes according to the given display order
								$.each(pref.setDisplayOrder, function(itemkey, item) {
									worker(item, pref.setValues[item]);
								});
							} else {
								// add check boxes according to the order it gets fed to us (probably strict alphabetical)
								$.each(pref.setValues, worker);
							}
							cell.appendChild(checkdiv);
							break;
	
						case 'customList':
							// add label to first column
							cell.style.textAlign = 'right';
							cell.style.paddingRight = '0.5em';
							label = document.createElement('label');
							label.setAttribute('for', pref.name);
							label.appendChild(document.createTextNode(pref.label + ':'));
							cell.appendChild(label);
							row.appendChild(cell);
	
							// add button to second column
							cell = document.createElement('td');
							cell.style.paddingRight = '1em';
							var button = document.createElement('button');
							button.setAttribute('id', pref.name);
							button.setAttribute('name', pref.name);
							button.setAttribute('type', 'button');
							button.addEventListener('click', Twinkle.config.listDialog.display, false);
							// use jQuery data on the button to store the current config value
							$(button).data({
								value: Twinkle.getPref(pref.name),
								pref: pref
							});
							button.appendChild(document.createTextNode('Sửa các mục'));
							cell.appendChild(button);
							break;
	
						default:
							alert('twinkleconfig: unknown data type for preference ' + pref.name);
							break;
					}
					row.appendChild(cell);
	
					// add help tip
					cell = document.createElement('td');
					cell.style.fontSize = '90%';
	
					cell.style.color = 'gray';
					if (pref.helptip) {
						// convert mentions of templates in the helptip to clickable links
						cell.innerHTML = pref.helptip.replace(/{{(.+?)}}/g,
							'{{<a href="' + mw.util.getUrl('Template:') + '$1" target="_blank">$1</a>}}');
					}
					// add reset link (custom lists don't need this, as their config value isn't displayed on the form)
					if (pref.type !== 'customList') {
						var resetlink = document.createElement('a');
						resetlink.setAttribute('href', '#tw-reset');
						resetlink.setAttribute('id', 'twinkle-config-reset-' + pref.name);
						resetlink.addEventListener('click', Twinkle.config.resetPrefLink, false);
						resetlink.style.cssFloat = 'right';
						resetlink.style.margin = '0 0.6em';
						resetlink.appendChild(document.createTextNode('Thiết lập lại'));
						cell.appendChild(resetlink);
					}
					row.appendChild(cell);
	
					container.appendChild(row);
					return true;
				});
				return true;
			});
	
			var footerbox = document.createElement('div');
			footerbox.setAttribute('id', 'twinkle-config-buttonpane');
			footerbox.style.backgroundColor = '#BCCADF';
			footerbox.style.padding = '0.5em';
			var button = document.createElement('button');
			button.setAttribute('id', 'twinkle-config-submit');
			button.setAttribute('type', 'submit');
			button.appendChild(document.createTextNode('Lưu các thay đổi'));
			footerbox.appendChild(button);
			var footerspan = document.createElement('span');
			footerspan.className = 'plainlinks';
			footerspan.style.marginLeft = '2.4em';
			footerspan.style.fontSize = '90%';
			var footera = document.createElement('a');
			footera.setAttribute('href', '#tw-reset-all');
			footera.setAttribute('id', 'twinkle-config-resetall');
			footera.addEventListener('click', Twinkle.config.resetAllPrefs, false);
			footera.appendChild(document.createTextNode('Phục hồi mặc định'));
			footerspan.appendChild(footera);
			footerbox.appendChild(footerspan);
			contentform.appendChild(footerbox);
	
			// since all the section headers exist now, we can try going to the requested anchor
			if (window.location.hash) {
				var loc = window.location.hash;
				window.location.hash = '';
				window.location.hash = loc;
			}
	
		} else if (mw.config.get('wgNamespaceNumber') === mw.config.get('wgNamespaceIds').user &&
				mw.config.get('wgTitle').indexOf(mw.config.get('wgUserName')) === 0 &&
				mw.config.get('wgPageName').slice(-3) === '.js') {
	
			var box = document.createElement('div');
			// Styled in twinkle.css
			box.setAttribute('id', 'twinkle-config-headerbox');
	
			var link,
				scriptPageName = mw.config.get('wgPageName').slice(mw.config.get('wgPageName').lastIndexOf('/') + 1,
					mw.config.get('wgPageName').lastIndexOf('.js'));
	
			if (scriptPageName === 'twinkleoptions') {
				// place "why not try the preference panel" notice
				box.setAttribute('class', 'config-twopt-box');
	
				if (mw.config.get('wgArticleId') > 0) {  // page exists
					box.appendChild(document.createTextNode('Trang này chứa cấu hình Twinkle của bạn. Bạn có thể thay đổi cấu hình ở '));
				} else {  // page does not exist
					box.appendChild(document.createTextNode('Bạn có thể tùy chỉnh Twinkle sao cho phù hợp với sở thích của mình bằng cách sử dụng'));
				}
				link = document.createElement('a');
				link.setAttribute('href', mw.util.getUrl(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').project] + ':Twinkle/Preferences'));
				link.appendChild(document.createTextNode('Bảng cấu hình Twinkle'));
				box.appendChild(link);
				box.appendChild(document.createTextNode(', hoặc bằng cách chỉnh sửa trang này (nếu bạn biết cách chỉnh sửa).'));
				$(box).insertAfter($('#contentSub'));
	
			} else if (['monobook', 'vector', 'cologneblue', 'modern', 'timeless', 'minerva', 'common'].indexOf(scriptPageName) !== -1) {
				// place "Looking for Twinkle options?" notice
				box.setAttribute('class', 'config-userskin-box');
	
				box.appendChild(document.createTextNode('Nếu bạn muốn cài đặt tùy chỉnh Twinkle, bạn có thể sử dụng '));
				link = document.createElement('a');
				link.setAttribute('href', mw.util.getUrl(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').project] + ':Twinkle/Preferences'));
				link.appendChild(document.createTextNode('Bảng cấu hình Twinkle'));
				box.appendChild(link);
				box.appendChild(document.createTextNode('.'));
				$(box).insertAfter($('#contentSub'));
			}
		}
	};
	
	// custom list-related stuff
	
	Twinkle.config.listDialog = {};
	
	Twinkle.config.listDialog.addRow = function twinkleconfigListDialogAddRow(dlgtable, value, label) {
		var contenttr = document.createElement('tr');
		// "remove" button
		var contenttd = document.createElement('td');
		var removeButton = document.createElement('button');
		removeButton.setAttribute('type', 'button');
		removeButton.addEventListener('click', function() {
			$(contenttr).remove();
		}, false);
		removeButton.textContent = 'Xóa';
		contenttd.appendChild(removeButton);
		contenttr.appendChild(contenttd);
	
		// value input box
		contenttd = document.createElement('td');
		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.className = 'twinkle-config-customlist-value';
		input.style.width = '97%';
		if (value) {
			input.setAttribute('value', value);
		}
		contenttd.appendChild(input);
		contenttr.appendChild(contenttd);
	
		// label input box
		contenttd = document.createElement('td');
		input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.className = 'twinkle-config-customlist-label';
		input.style.width = '98%';
		if (label) {
			input.setAttribute('value', label);
		}
		contenttd.appendChild(input);
		contenttr.appendChild(contenttd);
	
		dlgtable.appendChild(contenttr);
	};
	
	Twinkle.config.listDialog.display = function twinkleconfigListDialogDisplay(e) {
		var $prefbutton = $(e.target);
		var curvalue = $prefbutton.data('value');
		var curpref = $prefbutton.data('pref');
	
		var dialog = new Morebits.simpleWindow(720, 400);
		dialog.setTitle(curpref.label);
		dialog.setScriptName('Twinkle preferences');
	
		var dialogcontent = document.createElement('div');
		var dlgtable = document.createElement('table');
		dlgtable.className = 'wikitable';
		dlgtable.style.margin = '1.4em 1em';
		dlgtable.style.width = 'auto';
	
		var dlgtbody = document.createElement('tbody');
	
		// header row
		var dlgtr = document.createElement('tr');
		// top-left cell
		var dlgth = document.createElement('th');
		dlgth.style.width = '5%';
		dlgtr.appendChild(dlgth);
		// value column header
		dlgth = document.createElement('th');
		dlgth.style.width = '35%';
		dlgth.textContent = curpref.customListValueTitle ? curpref.customListValueTitle : 'Value';
		dlgtr.appendChild(dlgth);
		// label column header
		dlgth = document.createElement('th');
		dlgth.style.width = '60%';
		dlgth.textContent = curpref.customListLabelTitle ? curpref.customListLabelTitle : 'Label';
		dlgtr.appendChild(dlgth);
		dlgtbody.appendChild(dlgtr);
	
		// content rows
		var gotRow = false;
		$.each(curvalue, function(k, v) {
			gotRow = true;
			Twinkle.config.listDialog.addRow(dlgtbody, v.value, v.label);
		});
		// if there are no values present, add a blank row to start the user off
		if (!gotRow) {
			Twinkle.config.listDialog.addRow(dlgtbody);
		}
	
		// final "add" button
		var dlgtfoot = document.createElement('tfoot');
		dlgtr = document.createElement('tr');
		var dlgtd = document.createElement('td');
		dlgtd.setAttribute('colspan', '3');
		var addButton = document.createElement('button');
		addButton.style.minWidth = '8em';
		addButton.setAttribute('type', 'button');
		addButton.addEventListener('click', function() {
			Twinkle.config.listDialog.addRow(dlgtbody);
		}, false);
		addButton.textContent = 'Thêm';
		dlgtd.appendChild(addButton);
		dlgtr.appendChild(dlgtd);
		dlgtfoot.appendChild(dlgtr);
	
		dlgtable.appendChild(dlgtbody);
		dlgtable.appendChild(dlgtfoot);
		dialogcontent.appendChild(dlgtable);
	
		// buttonpane buttons: [Save changes] [Reset] [Cancel]
		var button = document.createElement('button');
		button.setAttribute('type', 'submit');  // so Morebits.simpleWindow puts the button in the button pane
		button.addEventListener('click', function() {
			Twinkle.config.listDialog.save($prefbutton, dlgtbody);
			dialog.close();
		}, false);
		button.textContent = 'Lưu các thay đổi';
		dialogcontent.appendChild(button);
		button = document.createElement('button');
		button.setAttribute('type', 'submit');  // so Morebits.simpleWindow puts the button in the button pane
		button.addEventListener('click', function() {
			Twinkle.config.listDialog.reset($prefbutton, dlgtbody);
		}, false);
		button.textContent = 'Thiết lập lại';
		dialogcontent.appendChild(button);
		button = document.createElement('button');
		button.setAttribute('type', 'submit');  // so Morebits.simpleWindow puts the button in the button pane
		button.addEventListener('click', function() {
			dialog.close();  // the event parameter on this function seems to be broken
		}, false);
		button.textContent = 'Hủy';
		dialogcontent.appendChild(button);
	
		dialog.setContent(dialogcontent);
		dialog.display();
	};
	
	// Resets the data value, re-populates based on the new (default) value, then saves the
	// old data value again (less surprising behaviour)
	Twinkle.config.listDialog.reset = function twinkleconfigListDialogReset(button, tbody) {
		// reset value on button
		var $button = $(button);
		var curpref = $button.data('pref');
		var oldvalue = $button.data('value');
		Twinkle.config.resetPref(curpref);
	
		// reset form
		var $tbody = $(tbody);
		$tbody.find('tr').slice(1).remove();  // all rows except the first (header) row
		// add the new values
		var curvalue = $button.data('value');
		$.each(curvalue, function(k, v) {
			Twinkle.config.listDialog.addRow(tbody, v.value, v.label);
		});
	
		// save the old value
		$button.data('value', oldvalue);
	};
	
	Twinkle.config.listDialog.save = function twinkleconfigListDialogSave(button, tbody) {
		var result = [];
		var current = {};
		$(tbody).find('input[type="text"]').each(function(inputkey, input) {
			if ($(input).hasClass('twinkle-config-customlist-value')) {
				current = { value: input.value };
			} else {
				current.label = input.value;
				// exclude totally empty rows
				if (current.value || current.label) {
					result.push(current);
				}
			}
		});
		$(button).data('value', result);
	};
	
	// reset/restore defaults
	
	Twinkle.config.resetPrefLink = function twinkleconfigResetPrefLink(e) {
		var wantedpref = e.target.id.substring(21); // "twinkle-config-reset-" prefix is stripped
	
		// search tactics
		$(Twinkle.config.sections).each(function(sectionkey, section) {
			if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
				return true;  // continue: skip impossibilities
			}
	
			var foundit = false;
	
			$(section.preferences).each(function(prefkey, pref) {
				if (pref.name !== wantedpref) {
					return true;  // continue
				}
				Twinkle.config.resetPref(pref);
				foundit = true;
				return false;  // break
			});
	
			if (foundit) {
				return false;  // break
			}
		});
		return false;  // stop link from scrolling page
	};
	
	Twinkle.config.resetPref = function twinkleconfigResetPref(pref) {
		switch (pref.type) {
	
			case 'boolean':
				document.getElementById(pref.name).checked = Twinkle.defaultConfig[pref.name];
				break;
	
			case 'string':
			case 'integer':
			case 'enum':
				document.getElementById(pref.name).value = Twinkle.defaultConfig[pref.name];
				break;
	
			case 'set':
				$.each(pref.setValues, function(itemkey) {
					if (document.getElementById(pref.name + '_' + itemkey)) {
						document.getElementById(pref.name + '_' + itemkey).checked = Twinkle.defaultConfig[pref.name].indexOf(itemkey) !== -1;
					}
				});
				break;
	
			case 'customList':
				$(document.getElementById(pref.name)).data('value', Twinkle.defaultConfig[pref.name]);
				break;
	
			default:
				alert('twinkleconfig: loại dữ liệu không xác định cho cấu hình ' + pref.name);
				break;
		}
	};
	
	Twinkle.config.resetAllPrefs = function twinkleconfigResetAllPrefs() {
		// no confirmation message - the user can just refresh/close the page to abort
		$(Twinkle.config.sections).each(function(sectionkey, section) {
			if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
				return true;  // continue: skip impossibilities
			}
			$(section.preferences).each(function(prefkey, pref) {
				if (!pref.adminOnly || Morebits.userIsSysop) {
					Twinkle.config.resetPref(pref);
				}
			});
			return true;
		});
		return false;  // stop link from scrolling page
	};
	
	Twinkle.config.save = function twinkleconfigSave(e) {
		Morebits.status.init(document.getElementById('twinkle-config-content'));
	
		var userjs = mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').user] + ':' + mw.config.get('wgUserName') + '/twinkleoptions.js';
		var wikipedia_page = new Morebits.wiki.page(userjs, 'Lưu cấu hình vào ' + userjs);
		wikipedia_page.setCallbackParameters(e.target);
		wikipedia_page.load(Twinkle.config.writePrefs);
	
		return false;
	};
	
	Twinkle.config.writePrefs = function twinkleconfigWritePrefs(pageobj) {
		var form = pageobj.getCallbackParameters();
	
		// this is the object which gets serialized into JSON; only
		// preferences that this script knows about are kept
		var newConfig = {optionsVersion: 2};
	
		// a comparison function is needed later on
		// it is just enough for our purposes (i.e. comparing strings, numbers, booleans,
		// arrays of strings, and arrays of { value, label })
		// and it is not very robust: e.g. compare([2], ["2"]) === true, and
		// compare({}, {}) === false, but it's good enough for our purposes here
		var compare = function(a, b) {
			if (Array.isArray(a)) {
				if (a.length !== b.length) {
					return false;
				}
				var asort = a.sort(), bsort = b.sort();
				for (var i = 0; asort[i]; ++i) {
					// comparison of the two properties of custom lists
					if ((typeof asort[i] === 'object') && (asort[i].label !== bsort[i].label ||
						asort[i].value !== bsort[i].value)) {
						return false;
					} else if (asort[i].toString() !== bsort[i].toString()) {
						return false;
					}
				}
				return true;
			}
			return a === b;
	
		};
	
		$(Twinkle.config.sections).each(function(sectionkey, section) {
			if (section.adminOnly && !Morebits.userIsSysop) {
				return;  // i.e. "continue" in this context
			}
	
			// reach each of the preferences from the form
			$(section.preferences).each(function(prefkey, pref) {
				var userValue;  // = undefined
	
				// only read form values for those prefs that have them
				if (!pref.adminOnly || Morebits.userIsSysop) {
					if (!section.hidden) {
						switch (pref.type) {
							case 'boolean':  // read from the checkbox
								userValue = form[pref.name].checked;
								break;
	
							case 'string':  // read from the input box or combo box
							case 'enum':
								userValue = form[pref.name].value;
								break;
	
							case 'integer':  // read from the input box
								userValue = parseInt(form[pref.name].value, 10);
								if (isNaN(userValue)) {
									Morebits.status.warn('Đang lưu', 'Giá trị bạn đã đặt cho ' + pref.name + ' (' + pref.value + ') không hợp lệ. Quá trình lưu sẽ tiếp tục, nhưng giá trị dữ liệu không hợp lệ sẽ bị bỏ qua.');
									userValue = null;
								}
								break;
	
							case 'set':  // read from the set of check boxes
								userValue = [];
								if (pref.setDisplayOrder) {
								// read only those keys specified in the display order
									$.each(pref.setDisplayOrder, function(itemkey, item) {
										if (form[pref.name + '_' + item].checked) {
											userValue.push(item);
										}
									});
								} else {
								// read all the keys in the list of values
									$.each(pref.setValues, function(itemkey) {
										if (form[pref.name + '_' + itemkey].checked) {
											userValue.push(itemkey);
										}
									});
								}
								break;
	
							case 'customList':  // read from the jQuery data stored on the button object
								userValue = $(form[pref.name]).data('value');
								break;
	
							default:
								alert('twinkleconfig: loại dữ liệu không xác định cho cấu hình ' + pref.name);
								break;
						}
					} else if (Twinkle.prefs) {
						// Retain the hidden preferences that may have customised by the user from twinkleoptions.js
						// undefined if not set
						userValue = Twinkle.prefs[pref.name];
					}
				}
	
				// only save those preferences that are *different* from the default
				if (userValue !== undefined && !compare(userValue, Twinkle.defaultConfig[pref.name])) {
					newConfig[pref.name] = userValue;
				}
			});
		});
	
		var text =
			'// twinkleoptions.js: personal Twinkle preferences file\n' +
			'//\n' +
			'// NOTE: The easiest way to change your Twinkle preferences is by using the\n' +
			'// Twinkle preferences panel, at [[' + Morebits.pageNameNorm + ']].\n' +
			'//\n' +
			'// This file is AUTOMATICALLY GENERATED.  Any changes you make (aside from\n' +
			'// changing the configuration parameters in a valid-JavaScript way) will be\n' +
			'// overwritten the next time you click "save" in the Twinkle preferences\n' +
			'// panel.  If modifying this file, make sure to use correct JavaScript.\n' +
			'// <no' + 'wiki>\n' +
			'\n' +
			'window.Twinkle.prefs = ';
		text += JSON.stringify(newConfig, null, 2);
		text +=
			';\n' +
			'\n' +
			'// </no' + 'wiki>\n' +
			'// End of twinkleoptions.js\n';
	
		pageobj.setPageText(text);
		pageobj.setEditSummary('Lưu cấu hình Twinkle: chỉnh sửa tự động từ [[:' + Morebits.pageNameNorm + ']]');
		pageobj.setChangeTags(Twinkle.changeTags);
		pageobj.setCreateOption('recreate');
		pageobj.save(Twinkle.config.saveSuccess);
	};
	
	Twinkle.config.saveSuccess = function twinkleconfigSaveSuccess(pageobj) {
		pageobj.getStatusElement().info('successful');
	
		var noticebox = document.createElement('div');
		noticebox.className = 'successbox';
		noticebox.style.fontSize = '100%';
		noticebox.style.marginTop = '2em';
		noticebox.innerHTML = '<p><b>Các cấu hình Twinkle của bạn đã được lưu lại.</b></p><p>Để xem các thay đổi, bạn sẽ cần <b>xóa hoàn toàn bộ đệm trình duyệt</b> (xem <a href="' + mw.util.getUrl('WP:BYPASS') + '" title="WP:BYPASS">WP:BYPASS</a> để có các chỉ dẫn chi tiết).</p>';
		Morebits.status.root.appendChild(noticebox);
		var noticeclear = document.createElement('br');
		noticeclear.style.clear = 'both';
		Morebits.status.root.appendChild(noticeclear);
	};
	
	Twinkle.addInitCallback(Twinkle.config.init);
	})(jQuery);
	
	
	// </nowiki>
	